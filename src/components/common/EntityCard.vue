<script setup lang="ts">
import type { EntityRow } from '@/types/domain/common.type'

const props = defineProps<{
  item: EntityRow
  titleFields?: string[]
  detailFields?: string[]
}>()

function valueFor(fields: string[]) {
  for (const field of fields) {
    const value = props.item[field]

    if (value !== undefined && value !== null && value !== '') {
      return String(value)
    }
  }

  return 'Sem título'
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}
</script>

<template>
  <article class="EntityCard">
    <h2 class="EntityCard-Title">
      {{ valueFor(titleFields ?? ['title', 'name', 'code', 'number', 'id']) }}
    </h2>

    <dl class="EntityCard-Fields">
      <template v-for="field in detailFields ?? Object.keys(item).slice(0, 8)" :key="field">
        <dt class="EntityCard-FieldName">{{ field }}</dt>
        <dd class="EntityCard-FieldValue">{{ displayValue(item[field]) }}</dd>
      </template>
    </dl>
  </article>
</template>

<style scoped lang="scss">
.EntityCard {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  padding: 16px;

  &-Title {
    margin: 0 0 12px;
    font-size: 18px;
  }

  &-Fields {
    display: grid;
    grid-template-columns: minmax(120px, 25%) 1fr;
    gap: 6px 12px;
    margin: 0;
  }

  &-FieldName {
    font-weight: bold;
    color: var(--color-text-secondary);
  }

  &-FieldValue {
    margin: 0;
    overflow-wrap: anywhere;
  }
}
</style>
