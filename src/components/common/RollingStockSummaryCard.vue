<script setup lang="ts">
import { ref, watchEffect } from 'vue'

import { getResource } from '@/services/api/resources.api'
import { getRollingStockSummary } from '@/services/api/summary.api'
import type { EntityRow } from '@/types/domain/common.type'

const props = defineProps<{
  item: EntityRow
}>()

const manufacturerLabel = ref<string | null>(null)
const gaugeLabel = ref<string | null>(null)
let activeRequestId = 0

function field(row: EntityRow, name: string) {
  const value = row[name]
  return value === null || value === undefined || value === '' ? null : String(value)
}

function titleFor(row: EntityRow) {
  const prefixedNumber = [field(row, 'prefix'), field(row, 'number')].filter(Boolean).join(' ')
  const explicitTitle = field(row, 'painted_identifier')

  if (explicitTitle) {
    return explicitTitle
  }

  return prefixedNumber || field(row, 'id') || 'Material rodante'
}

function readLabel(row: EntityRow, keys: string[]) {
  for (const key of keys) {
    const value = field(row, key)
    if (value) {
      return value
    }
  }

  return null
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    manufacturerLabel.value = null
    gaugeLabel.value = null
    const row = props.item

    const rollingStockId = field(row, 'id')
    const manufacturerId = field(row, 'manufacturer_id')
    const gaugeId = field(row, 'gauge_id')

    if (!manufacturerId && !gaugeId) {
      return
    }

    if (rollingStockId) {
      try {
        const summary = await getRollingStockSummary(rollingStockId)
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        const summaryManufacturer =
          readLabel(summary, ['manufacturer_name']) ??
          readLabel((summary.manufacturer as EntityRow | undefined) ?? {}, [
            'name',
            'short_name',
            'full_name'
          ])
        const summaryGauge =
          readLabel(summary, ['gauge_name', 'track_gauge_name']) ??
          readLabel((summary.track_gauge as EntityRow | undefined) ?? {}, ['name', 'code', 'size'])

        manufacturerLabel.value = summaryManufacturer
        gaugeLabel.value = summaryGauge
      } catch (error) {
        console.warn(
          '[RollingStockSummaryCard] Failed to load /rolling-stock/:id/summary; using resource fallback.',
          error
        )
      }
    }

    if (manufacturerId && !manufacturerLabel.value) {
      try {
        const manufacturer = await getResource('/manufacturers', manufacturerId)
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        manufacturerLabel.value = readLabel(manufacturer, ['short_name', 'full_name', 'name'])
      } catch (error) {
        console.warn('[RollingStockSummaryCard] Failed manufacturer resource fallback.', error)
        manufacturerLabel.value = null
      }
    }

    if (gaugeId && !gaugeLabel.value) {
      try {
        const gauge = await getResource('/track-gauges', gaugeId)
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        gaugeLabel.value = readLabel(gauge, ['name', 'code', 'size'])
      } catch (error) {
        console.warn('[RollingStockSummaryCard] Failed track gauge resource fallback.', error)
        gaugeLabel.value = null
      }
    }
  })()
})
</script>

<template>
  <article class="RollingStockSummaryCard">
    <strong>
      {{ titleFor(item) }}
    </strong>
    <p v-if="field(item, 'type')">Tipo: {{ field(item, 'type') }}</p>
    <p v-if="field(item, 'serial_number')">Série: {{ field(item, 'serial_number') }}</p>
    <p v-if="field(item, 'sigo_number')">SIGO: {{ field(item, 'sigo_number') }}</p>
    <small>
      <span v-if="field(item, 'manufacturer_id')"
        >Fabricante {{ manufacturerLabel ?? field(item, 'manufacturer_id') }}</span
      >
      <span v-if="field(item, 'gauge_id')">
        · Bitola {{ gaugeLabel ?? field(item, 'gauge_id') }}</span
      >
      <span v-if="field(item, 'build_year')"> · Ano {{ field(item, 'build_year') }}</span>
    </small>
  </article>
</template>

<style scoped lang="scss">
.RollingStockSummaryCard {
  display: grid;
  gap: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: var(--color-background-soft);
  padding: var(--space-3);
}
</style>
