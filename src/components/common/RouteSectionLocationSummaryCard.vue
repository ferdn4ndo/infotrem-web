<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'

import { getResource } from '@/services/api/resources.api'
import { getLocationSummary } from '@/services/api/summary.api'
import type { EntityRow } from '@/types/domain/common.type'

const props = defineProps<{
  item: EntityRow
  kilometers?: EntityRow[]
}>()

const locationLabel = ref<string | null>(null)
let activeRequestId = 0

function field(row: EntityRow, name: string) {
  const value = row[name]
  return value === null || value === undefined || value === '' ? null : String(value)
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    locationLabel.value = null
    const locationId = field(props.item, 'location_id')
    if (!locationId) {
      return
    }

    try {
      const summary = await getLocationSummary(locationId)
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      locationLabel.value =
        field(summary, 'location_name') ??
        field((summary.location as EntityRow | undefined) ?? {}, 'name') ??
        field(summary, 'name')
    } catch (error) {
      console.warn(
        '[RouteSectionLocationSummaryCard] Failed to load /locations/:id/summary; using resource fallback.',
        error
      )
      try {
        const location = await getResource('/locations', locationId)
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        locationLabel.value = field(location, 'name') ?? field(location, 'code')
      } catch (fallbackError) {
        console.warn(
          '[RouteSectionLocationSummaryCard] Failed location resource fallback.',
          fallbackError
        )
        locationLabel.value = null
      }
    }
  })()
})
</script>

<template>
  <article class="RouteSectionLocationSummaryCard">
    <strong>
      Ordem {{ field(item, 'location_route_order') ?? field(item, 'order') ?? '?' }}
    </strong>
    <RouterLink
      v-if="field(item, 'location_id')"
      :to="{
        name: 'location-detail',
        params: { id: field(item, 'location_id') }
      }"
    >
      Local {{ locationLabel ?? field(item, 'location_id') }}
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
  gap: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background: var(--color-background-soft);
  padding: var(--space-3);

  &-Kilometers {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
}
</style>
