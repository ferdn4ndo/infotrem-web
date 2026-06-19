<script setup lang="ts">
export interface AppButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

withDefaults(defineProps<AppButtonProps>(), {
  variant: 'primary',
  type: 'button',
  disabled: false
})
</script>

<template>
  <button class="AppButton" :class="`AppButton--${variant}`" :disabled="disabled" :type="type">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.AppButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 36px;
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent;
  border-radius: $radius-md;
  font-size: var(--font-size-md);
  line-height: var(--line-height-tight);
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-border);
    outline-offset: 2px;
  }

  &--primary {
    background-color: var(--color-primary-normal);
    border-color: var(--color-primary-border);
    color: var(--color-heading);
  }

  &--secondary {
    background-color: var(--color-secondary-normal);
    border-color: var(--color-secondary-border);
    color: var(--color-heading);
  }

  &--ghost {
    background-color: transparent;
    border-color: var(--color-border);
    color: var(--color-text);
  }

  &--danger {
    background-color: #b30024;
    border-color: #8f001d;
    color: #fff;
  }
}
</style>
