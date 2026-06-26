<script setup lang="ts">
export interface EmptyStateProps {
  title: string
  description?: string
  icon?: string
}

withDefaults(defineProps<EmptyStateProps>(), {
  description: '',
  icon: 'fa-solid fa-circle-info'
})
</script>

<template>
  <section class="EmptyState" role="status" aria-live="polite">
    <font-awesome-icon class="EmptyState-Icon" :icon="icon" />
    <h2 class="EmptyState-Title">{{ title }}</h2>
    <p v-if="description" class="EmptyState-Description">{{ description }}</p>
    <slot name="action" />
  </section>
</template>

<style lang="scss" scoped>
.EmptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background-color: var(--color-background-soft);
  text-align: center;

  &-Icon {
    color: var(--color-primary-normal);
    font-size: var(--font-size-xl);
  }

  &-Title {
    margin: 0;
    color: var(--color-heading);
    font-size: var(--font-size-lg);
  }

  &-Description {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-md);
  }
}
</style>
