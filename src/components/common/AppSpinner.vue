<script setup lang="ts">
export interface AppSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<AppSpinnerProps>(), {
  size: 'md'
})
</script>

<template>
  <span class="AppSpinner" :class="`AppSpinner--${size}`" aria-hidden="true" />
</template>

<style lang="scss" scoped>
.AppSpinner {
  display: inline-block;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary-normal);
  border-radius: 50%;
  animation: AppSpinner-Rotate 0.8s linear infinite;

  &--sm {
    width: 16px;
    height: 16px;
  }

  &--md {
    width: 24px;
    height: 24px;
  }

  &--lg {
    width: 32px;
    height: 32px;
  }
}

@keyframes AppSpinner-Rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .AppSpinner {
    animation-duration: 1.6s;
  }
}
</style>
