<script setup lang="ts">
import type { EntityRow } from '@/types/domain/common.type'

defineProps<{
  item: EntityRow
}>()

function field(row: EntityRow, name: string) {
  const value = row[name]
  return value === null || value === undefined || value === '' ? null : String(value)
}
</script>

<template>
  <article class="PathPointSummaryCard">
    <strong
      >Ponto {{ field(item, 'order') ?? field(item, 'sequence') ?? field(item, 'id') }}</strong
    >
    <p>
      {{ field(item, 'latitude') ?? field(item, 'lat') ?? 'Latitude desconhecida' }},
      {{ field(item, 'longitude') ?? field(item, 'lng') ?? 'Longitude desconhecida' }}
    </p>
    <small v-if="field(item, 'path_id')">Linha {{ field(item, 'path_id') }}</small>
  </article>
</template>

<style scoped lang="scss">
.PathPointSummaryCard {
  display: grid;
  gap: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: var(--color-background-soft);
  padding: var(--space-3);
}
</style>
