<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type * as Leaflet from 'leaflet'

import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { routeForEntityRow } from '@/services/api/entity-routing'
import * as MapApi from '@/services/api/map.api'
import { normalizeMapItems, type NormalizedMapItem } from '@/services/api/map-normalization'

const router = useRouter()
const mapContainer = ref<HTMLElement | null>(null)
const items = ref<NormalizedMapItem[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const mappedItemCount = computed(() => items.value.filter((item) => item.coordinates).length)

let leafletModule: typeof Leaflet | null = null
let map: Leaflet.Map | null = null
let markersLayer: Leaflet.LayerGroup | null = null
let mapRequestController: AbortController | null = null
let activeMapRequestId = 0
let mapEventDebounceHandle: ReturnType<typeof setTimeout> | null = null

function labelFor(item: NormalizedMapItem) {
  return routeForEntityRow(item).label
}

function mapSize() {
  if (!mapContainer.value) {
    return { width: 1200, height: 640 }
  }

  return {
    width: Math.max(Math.round(mapContainer.value.clientWidth), 360),
    height: Math.max(Math.round(mapContainer.value.clientHeight), 320)
  }
}

function clearMarkers() {
  markersLayer?.clearLayers()
}

function renderMarkers() {
  if (!leafletModule || !markersLayer) {
    return
  }

  clearMarkers()

  for (const item of items.value) {
    if (!item.coordinates) {
      continue
    }

    const marker = leafletModule.marker([item.coordinates.lat, item.coordinates.lng])
    marker.bindTooltip(labelFor(item))
    marker.on('click', () => {
      const resolution = routeForEntityRow(item)
      if (resolution.target) {
        void router.push(resolution.target)
      }
    })
    marker.addTo(markersLayer)
  }
}

async function loadMapData() {
  if (!map) {
    return
  }

  isLoading.value = true
  errorMessage.value = null
  const requestId = ++activeMapRequestId
  mapRequestController?.abort()
  const controller = new AbortController()
  mapRequestController = controller

  try {
    const center = map.getCenter()
    const nextZoom = map.getZoom()
    const size = mapSize()
    const response = await MapApi.getMapData(
      {
        lat: center.lat,
        lng: center.lng,
        zoom: nextZoom,
        width: size.width,
        height: size.height
      },
      { signal: controller.signal }
    )
    if (controller.signal.aborted || requestId !== activeMapRequestId) {
      return
    }
    items.value = normalizeMapItems(response.items)
    renderMarkers()
  } catch (error) {
    if (controller.signal.aborted || requestId !== activeMapRequestId) {
      return
    }
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o mapa.'
  } finally {
    if (!controller.signal.aborted && requestId === activeMapRequestId) {
      isLoading.value = false
    }
  }
}

function scheduleMapDataLoad() {
  if (mapEventDebounceHandle) {
    clearTimeout(mapEventDebounceHandle)
  }
  mapEventDebounceHandle = setTimeout(() => {
    void loadMapData()
  }, 300)
}

function clearMapDebounce() {
  if (mapEventDebounceHandle) {
    clearTimeout(mapEventDebounceHandle)
    mapEventDebounceHandle = null
  }
}

function handleMapChanged() {
  scheduleMapDataLoad()
}

onMounted(async () => {
  if (!mapContainer.value) {
    return
  }

  await import('leaflet/dist/leaflet.css')
  leafletModule = await import('leaflet')
  map = leafletModule.map(mapContainer.value, {
    center: [-23.55, -46.63],
    zoom: 8,
    minZoom: 4
  })
  leafletModule
    .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    })
    .addTo(map)
  markersLayer = leafletModule.layerGroup().addTo(map)

  map.on('moveend', handleMapChanged)
  map.on('zoomend', handleMapChanged)

  await loadMapData()
})

onUnmounted(() => {
  clearMapDebounce()
  mapRequestController?.abort()
  map?.off('moveend', handleMapChanged)
  map?.off('zoomend', handleMapChanged)
  clearMarkers()
  map?.remove()
  markersLayer = null
  map = null
  mapRequestController = null
})
</script>

<template>
  <main class="MapView">
    <h1>Mapa</h1>
    <StatusMessage v-if="isLoading" state="loading" message="Carregando mapa..." />
    <StatusMessage v-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-if="!isLoading && !errorMessage && items.length === 0"
      title="Nenhum resultado no mapa"
      description="Ajuste o zoom ou mova o mapa para buscar novamente."
    />

    <AppCard class="MapView-MapCard">
      <div ref="mapContainer" class="MapView-Container" data-cy="map-canvas" />
    </AppCard>

    <p v-if="items.length > 0" class="MapView-Summary">
      {{ mappedItemCount }} de {{ items.length }} resultados possuem coordenadas.
    </p>

    <section class="MapView-Results" aria-live="polite">
      <RoutableEntitySummaryCard
        v-for="(item, index) in items"
        :key="`${item.entity_type}-${item.id ?? index}`"
        class="MapView-Result"
        data-cy="map-result"
        :item="item"
        :title-fields="['title', 'name', 'code', 'entity_type', 'id']"
      >
        <strong>{{ labelFor(item) }}</strong>
        <p v-if="item.coordinates" class="MapView-Coordinates">
          {{ item.coordinates.lat }}, {{ item.coordinates.lng }}
        </p>
        <p v-else class="MapView-Coordinates">Coordenadas indisponíveis</p>
      </RoutableEntitySummaryCard>
    </section>
  </main>
</template>

<style scoped lang="scss">
.MapView {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);

  &-MapCard {
    margin-bottom: var(--space-4);
    overflow: hidden;
  }

  &-Container {
    width: 100%;
    min-height: min(68vh, 680px);
  }

  &-Summary {
    margin: 0 0 var(--space-4);
  }

  &-Results {
    display: grid;
    gap: var(--space-4);
  }

  &-Result {
    color: inherit;
    text-decoration: none;
  }

  &-Coordinates {
    margin-bottom: var(--space-2);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);

    &-Container {
      min-height: 52vh;
    }
  }
}
</style>
