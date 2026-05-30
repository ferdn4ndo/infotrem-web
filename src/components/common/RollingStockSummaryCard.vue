<script setup lang="ts">
import type { EntityRow } from '@/types/domain/common.type'

defineProps<{
  item: EntityRow
}>()

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
        >Fabricante {{ field(item, 'manufacturer_id') }}</span
      >
      <span v-if="field(item, 'gauge_id')"> · Bitola {{ field(item, 'gauge_id') }}</span>
      <span v-if="field(item, 'build_year')"> · Ano {{ field(item, 'build_year') }}</span>
    </small>
  </article>
</template>

<style scoped lang="scss">
.RollingStockSummaryCard {
  display: grid;
  gap: 6px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  padding: 12px;
}
</style>
