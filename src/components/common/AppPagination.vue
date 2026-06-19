<script setup lang="ts">
import { computed } from 'vue'

export interface AppPaginationProps {
  limit?: number
  offset?: number
  count: number
}

const props = withDefaults(defineProps<AppPaginationProps>(), {
  limit: 24,
  offset: 0
})

const emit = defineEmits<{
  (e: 'update:offset', value: number): void
}>()

const currentPage = computed(() => Math.floor(props.offset / props.limit) + 1)
const totalPages = computed(() => Math.max(1, Math.ceil(props.count / props.limit)))
const canGoPrevious = computed(() => props.offset > 0)
const canGoNext = computed(() => props.offset + props.limit < props.count)

function goToPage(page: number) {
  const normalizedPage = Math.min(Math.max(1, page), totalPages.value)
  emit('update:offset', (normalizedPage - 1) * props.limit)
}
</script>

<template>
  <nav class="AppPagination" aria-label="Paginação">
    <button type="button" :disabled="!canGoPrevious" @click="goToPage(currentPage - 1)">
      Anterior
    </button>
    <span class="AppPagination-Info">Página {{ currentPage }} de {{ totalPages }}</span>
    <button type="button" :disabled="!canGoNext" @click="goToPage(currentPage + 1)">Próxima</button>
  </nav>
</template>

<style scoped lang="scss">
.AppPagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-4);

  button {
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    padding: var(--space-2) var(--space-3);
    background: var(--color-background-soft);
    color: var(--color-text);
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary-border);
      outline-offset: 2px;
    }
  }

  &-Info {
    font-size: var(--font-size-sm);
  }
}
</style>
