<script setup lang="ts">
export interface AppCardProps {
  padding?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<AppCardProps>(), {
  padding: 'md'
})
</script>

<template>
  <section class="AppCard" :class="`AppCard--${padding}`">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.AppCard {
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  background-color: var(--color-background-soft);

  &--sm {
    padding: var(--space-3);
  }

  &--md {
    padding: var(--space-4);
  }

  &--lg {
    padding: var(--space-6);
  }
}
</style>
