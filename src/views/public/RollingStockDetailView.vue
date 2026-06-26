<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import RelationManager from '@/components/common/RelationManager.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { findResource } from '@/services/api/resources'
import { getResource } from '@/services/api/resources.api'
import { listNested } from '@/services/api/social.api'
import { getRollingStockSummary } from '@/services/api/summary.api'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()

const item = ref<EntityRow | null>(null)
const manufacturerName = ref<string | null>(null)
const gaugeName = ref<string | null>(null)
const subtype = ref<string>('Não identificado')
const mediaCount = ref(0)
const informationCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
let activeRequestId = 0

const rollingStockId = computed(() => String(route.params.id ?? ''))
const rollingStockResource = computed(() => findResource('rolling-stock'))

function field(row: EntityRow | null, key: string) {
  const value = row?.[key]
  return value === null || value === undefined || value === '' ? null : String(value)
}

function readList(row: EntityRow, key: string) {
  const value = row[key]
  return Array.isArray(value) ? (value as EntityRow[]) : []
}

async function resolveLabel(path: string, id: string, candidates: string[]) {
  try {
    const row = await getResource(path, id)
    for (const key of candidates) {
      const value = field(row, key)
      if (value) {
        return value
      }
    }
    return id
  } catch (error) {
    console.warn(`[RollingStockDetailView] Falha ao resolver ${path}/${id}.`, error)
    return id
  }
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    if (!rollingStockId.value) {
      return
    }
    isLoading.value = true
    errorMessage.value = null
    manufacturerName.value = null
    gaugeName.value = null
    subtype.value = 'Não identificado'

    try {
      const summary = await getRollingStockSummary(rollingStockId.value)
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      item.value = (summary.rolling_stock as EntityRow | undefined) ?? summary
      mediaCount.value = Array.isArray(summary.media) ? summary.media.length : 0
      informationCount.value = Array.isArray(summary.information) ? summary.information.length : 0

      if (readList(summary, 'freight_car').length > 0) {
        subtype.value = 'Freight car'
      } else if (readList(summary, 'passenger_car').length > 0) {
        subtype.value = 'Passenger car'
      } else if (readList(summary, 'non_revenue_car').length > 0) {
        subtype.value = 'Non-revenue car'
      }
    } catch (error) {
      console.warn(
        '[RollingStockDetailView] Falha ao carregar /rolling-stock/:id/summary; usando fallback por recursos base.',
        error
      )
      try {
        const [rollingStock, media, information] = await Promise.all([
          getResource('/rolling-stock', rollingStockId.value),
          listNested(`/rolling-stock/${rollingStockId.value}`, 'media'),
          listNested(`/rolling-stock/${rollingStockId.value}`, 'information')
        ])
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        item.value = rollingStock
        mediaCount.value = media.count
        informationCount.value = information.count
      } catch (fallbackError) {
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        errorMessage.value =
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Não foi possível carregar os detalhes do material rodante.'
      }
    }

    const manufacturerId = field(item.value, 'manufacturer_id')
    const gaugeId = field(item.value, 'gauge_id')
    if (manufacturerId) {
      manufacturerName.value = await resolveLabel('/manufacturers', manufacturerId, [
        'short_name',
        'full_name',
        'name'
      ])
    }
    if (gaugeId) {
      gaugeName.value = await resolveLabel('/track-gauges', gaugeId, ['name', 'code', 'size'])
    }

    if (!cancelled && requestId === activeRequestId) {
      isLoading.value = false
    }
  })()
})
</script>

<template>
  <section class="RollingStockDetailView">
    <RouterLink to="/rolling-stock">Voltar para material rodante</RouterLink>

    <h1>
      {{ field(item, 'painted_identifier') ?? `Material rodante ${field(item, 'id') ?? ''}` }}
    </h1>
    <StatusMessage v-if="isLoading" state="loading" message="Carregando material rodante..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />

    <AppCard v-if="item" class="RollingStockDetailView-Identity">
      <p><strong>Identificador:</strong> {{ field(item, 'painted_identifier') ?? '—' }}</p>
      <p><strong>Série:</strong> {{ field(item, 'serial_number') ?? '—' }}</p>
      <p><strong>Tipo:</strong> {{ field(item, 'type') ?? '—' }}</p>
      <p><strong>Subtipo:</strong> {{ subtype }}</p>
      <p>
        <strong>Fabricante:</strong> {{ manufacturerName ?? field(item, 'manufacturer_id') ?? '—' }}
      </p>
      <p><strong>Bitola:</strong> {{ gaugeName ?? field(item, 'gauge_id') ?? '—' }}</p>
    </AppCard>

    <section class="RollingStockDetailView-Counts">
      <AppCard>
        <strong>Mídia relacionada</strong>
        <p>{{ mediaCount }}</p>
      </AppCard>
      <AppCard>
        <strong>Informações</strong>
        <p>{{ informationCount }}</p>
      </AppCard>
    </section>

    <template v-if="rollingStockResource">
      <RelationManager
        v-for="relation in rollingStockResource.relations ?? []"
        :key="relation.key"
        :relation="relation"
        :parent-resource="rollingStockResource"
        :parent-id="rollingStockId"
      />
    </template>
  </section>
</template>

<style scoped lang="scss">
.RollingStockDetailView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-4);
  padding: var(--space-4);

  &-Identity,
  &-Section,
  &-Counts {
    display: grid;
    gap: var(--space-2);
  }

  &-Counts {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));

    p {
      margin: var(--space-2) 0 0;
      font-size: var(--font-size-xl);
    }
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
