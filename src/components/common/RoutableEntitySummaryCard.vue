<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import PathPointSummaryCard from '@/components/common/PathPointSummaryCard.vue'
import RollingStockSummaryCard from '@/components/common/RollingStockSummaryCard.vue'
import { routeForEntityRow } from '@/services/api/entity-routing'
import type { EntityRow } from '@/types/domain/common.type'

const props = withDefaults(
  defineProps<{
    item: EntityRow
    titleFields?: string[]
    variant?: 'auto' | 'path-point' | 'rolling-stock'
  }>(),
  {
    titleFields: () => ['title', 'name', 'code', 'number', 'id'],
    variant: 'auto'
  }
)

const route = computed(() => routeForEntityRow(props.item))
const renderer = computed(() => {
  if (props.variant !== 'auto') {
    return props.variant
  }

  const entityType = String(props.item.entity_type ?? '')
  if (entityType === 'rolling_stock' || 'painted_identifier' in props.item) {
    return 'rolling-stock'
  }
  if (
    'latitude' in props.item &&
    'longitude' in props.item &&
    ('order' in props.item || 'sequence' in props.item)
  ) {
    return 'path-point'
  }

  return 'entity'
})
</script>

<template>
  <component
    :is="route.target ? RouterLink : 'div'"
    class="RoutableEntitySummaryCard"
    :to="route.target ?? undefined"
  >
    <slot />
    <RollingStockSummaryCard v-if="renderer === 'rolling-stock'" :item="item" />
    <PathPointSummaryCard v-else-if="renderer === 'path-point'" :item="item" />
    <EntityCard v-else :item="item" :title-fields="titleFields" />
    <small v-if="route.reason">{{ route.reason }}</small>
  </component>
</template>

<style scoped lang="scss">
.RoutableEntitySummaryCard {
  display: grid;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}
</style>
