<script setup lang="ts">
import { RouterLink } from 'vue-router'

import type { EntityRow } from '@/types/domain/common.type'

defineProps<{
  item: EntityRow
  kilometers?: EntityRow[]
}>()

function field(row: EntityRow, name: string) {
  const value = row[name]
  return value === null || value === undefined || value === '' ? null : String(value)
}
</script>

<template>
  <article class="RouteSectionLocationSummaryCard">
    <strong>
      Ordem {{ field(item, 'location_route_order') ?? field(item, 'order') ?? '?' }}
    </strong>
    <RouterLink
      v-if="field(item, 'location_id')"
      :to="{
        name: 'resource-detail',
        params: { resource: 'locations', id: field(item, 'location_id') }
      }"
    >
      Local {{ field(item, 'location_id') }}
    </RouterLink>
    <p v-else>Local {{ field(item, 'id') ?? 'desconhecido' }}</p>

    <div v-if="kilometers?.length" class="RouteSectionLocationSummaryCard-Kilometers">
      <span v-for="kilometer in kilometers" :key="String(kilometer.id)">
        km {{ field(kilometer, 'kilometer') ?? field(kilometer, 'km') ?? field(kilometer, 'id') }}
      </span>
    </div>
  </article>
</template>

<style scoped lang="scss">
.RouteSectionLocationSummaryCard {
  display: grid;
  gap: 8px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  padding: 12px;

  &-Kilometers {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
