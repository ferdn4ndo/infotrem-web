<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type * as Leaflet from 'leaflet'

import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import RelationManager from '@/components/common/RelationManager.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { findResource } from '@/services/api/resources'
import { getResource } from '@/services/api/resources.api'
import { listNested } from '@/services/api/social.api'
import { getLocationSummary } from '@/services/api/summary.api'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()

const item = ref<EntityRow | null>(null)
const informationCount = ref(0)
const trackGaugeCount = ref(0)
const pathCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const mapContainer = ref<HTMLElement | null>(null)

const locationId = computed(() => String(route.params.id ?? ''))
const locationResource = computed(() => findResource('locations'))
const hasCoordinates = computed(() => {
  const lat = Number(item.value?.center_latitude ?? item.value?.latitude)
  const lng = Number(item.value?.center_longitude ?? item.value?.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng)
})

let leafletModule: typeof Leaflet | null = null
let map: Leaflet.Map | null = null
let marker: Leaflet.Marker | null = null
let activeRequestId = 0

function coordinates() {
  const lat = Number(item.value?.center_latitude ?? item.value?.latitude)
  const lng = Number(item.value?.center_longitude ?? item.value?.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }
  return { lat, lng }
}

async function mountSinglePinMap() {
  const coords = coordinates()
  if (!coords || !mapContainer.value) {
    return
  }

  if (!leafletModule) {
    await import('leaflet/dist/leaflet.css')
    leafletModule = await import('leaflet')
  }

  if (!map) {
    map = leafletModule.map(mapContainer.value, {
      center: [coords.lat, coords.lng],
      zoom: 13,
      minZoom: 4
    })
    leafletModule
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      })
      .addTo(map)
  }

  marker?.remove()
  marker = leafletModule.marker([coords.lat, coords.lng]).addTo(map)
  map.setView([coords.lat, coords.lng], 13)
}

function cleanupMap() {
  marker?.remove()
  marker = null
  map?.remove()
  map = null
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
    cleanupMap()
  })

  void (async () => {
    if (!locationId.value) {
      return
    }
    isLoading.value = true
    errorMessage.value = null

    try {
      const summary = await getLocationSummary(locationId.value)
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      item.value = (summary.location as EntityRow | undefined) ?? summary
      informationCount.value = Array.isArray(summary.information) ? summary.information.length : 0
      trackGaugeCount.value = Array.isArray(summary.track_gauges) ? summary.track_gauges.length : 0
      pathCount.value = Array.isArray(summary.paths) ? summary.paths.length : 0
      if (hasCoordinates.value) {
        await mountSinglePinMap()
      } else {
        cleanupMap()
      }
    } catch (error) {
      console.warn(
        '[LocationDetailView] Falha ao carregar /locations/:id/summary; usando fallback por recursos base.',
        error
      )
      try {
        const [location, information, trackGauges, paths] = await Promise.all([
          getResource('/locations', locationId.value),
          listNested(`/locations/${locationId.value}`, 'information'),
          listNested(`/locations/${locationId.value}`, 'track-gauges'),
          listNested(`/locations/${locationId.value}`, 'paths')
        ])
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        item.value = location
        informationCount.value = information.count
        trackGaugeCount.value = trackGauges.count
        pathCount.value = paths.count
        if (hasCoordinates.value) {
          await mountSinglePinMap()
        } else {
          cleanupMap()
        }
      } catch (fallbackError) {
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        errorMessage.value =
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Não foi possível carregar os detalhes do local.'
      }
    } finally {
      if (!cancelled && requestId === activeRequestId) {
        isLoading.value = false
      }
    }
  })()
})

onUnmounted(() => {
  cleanupMap()
})
</script>

<template>
  <section class="LocationDetailView">
    <RouterLink to="/locations">Voltar para locais</RouterLink>

    <h1>{{ item?.name ?? 'Local' }}</h1>
    <StatusMessage v-if="isLoading" state="loading" message="Carregando local..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />

    <AppCard v-if="item">
      <EntityCard
        :item="item"
        :title-fields="['name', 'code', 'id']"
        :detail-fields="['status', 'center_latitude', 'center_longitude']"
      />
    </AppCard>

    <section v-if="hasCoordinates" class="LocationDetailView-MapSection">
      <h2>Localização</h2>
      <AppCard>
        <div
          ref="mapContainer"
          class="LocationDetailView-MapContainer"
          role="region"
          aria-label="Mapa com posição do local"
        />
      </AppCard>
    </section>
    <EmptyState
      v-else
      title="Sem coordenadas"
      description="Este local não possui coordenadas para exibir no mapa."
    />

    <section class="LocationDetailView-Counts">
      <AppCard>
        <strong>Informações</strong>
        <p>{{ informationCount }}</p>
      </AppCard>
      <AppCard>
        <strong>Bitolas</strong>
        <p>{{ trackGaugeCount }}</p>
      </AppCard>
      <AppCard>
        <strong>Linhas</strong>
        <p>{{ pathCount }}</p>
      </AppCard>
    </section>

    <template v-if="locationResource">
      <RelationManager
        v-for="relation in locationResource.relations ?? []"
        :key="relation.key"
        :relation="relation"
        :parent-resource="locationResource"
        :parent-id="locationId"
      />
    </template>
  </section>
</template>

<style scoped lang="scss">
.LocationDetailView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-4);
  padding: var(--space-4);

  &-Section,
  &-MapSection,
  &-Counts {
    display: grid;
    gap: var(--space-3);
  }

  &-Counts {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));

    p {
      margin: var(--space-2) 0 0;
      font-size: var(--font-size-xl);
    }
  }

  &-MapContainer {
    width: 100%;
    min-height: 360px;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
