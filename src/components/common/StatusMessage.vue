<script setup lang="ts">
import AppSpinner from '@/components/common/AppSpinner.vue'

export interface StatusMessageProps {
  state: 'loading' | 'empty' | 'error'
  message?: string
}

defineProps<StatusMessageProps>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div class="StatusMessage" :class="`StatusMessage--${state}`" role="status" aria-live="polite">
    <AppSpinner v-if="state === 'loading'" />
    <p class="StatusMessage-Text">
      {{
        message ||
        (state === 'loading'
          ? 'Carregando...'
          : state === 'empty'
            ? 'Nenhum resultado encontrado.'
            : 'Nao foi possivel carregar os dados.')
      }}
    </p>
    <button
      v-if="state === 'error'"
      class="StatusMessage-Retry"
      type="button"
      @click="emit('retry')"
    >
      Tentar novamente
    </button>
    <slot name="retry" />
  </div>
</template>

<style lang="scss" scoped>
.StatusMessage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-6);
  border-radius: $radius-md;
  text-align: center;

  &--loading,
  &--empty {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
  }

  &--error {
    background-color: var(--color-background-soft);
    border: 1px solid #b30024;
  }

  &-Text {
    margin: 0;
    color: var(--color-text);
  }

  &-Retry {
    border: 1px solid var(--color-primary-border);
    border-radius: $radius-md;
    padding: var(--space-2) var(--space-3);
    background-color: var(--color-primary-normal);
    color: var(--color-heading);
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--color-primary-border);
      outline-offset: 2px;
    }
  }
}
</style>
