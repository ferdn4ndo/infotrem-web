<script setup lang="ts">
export interface Props {
  icon?: string
  scheme?: string
  roundLeft?: boolean
  roundRight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'fa-solid fa-circle-info',
  scheme: 'primary',
  roundLeft: true,
  roundRight: true,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

function handleButtonClick() {
  emit('click')
}

function isPrimary() {
  return props.scheme == 'primary'
}

function isSecondary() {
  return props.scheme == 'secondary'
}
</script>

<template>
  <button
    class="ButtonFlat"
    :class="{
      'ButtonFlat--primary': isPrimary(),
      'ButtonFlat--secondary': isSecondary(),
      'ButtonFlat--round-left': props.roundLeft,
      'ButtonFlat--round-right': props.roundRight,
    }"
    @click.stop="handleButtonClick"
  >
    <font-awesome-icon :icon="icon" />
  </button>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ButtonFlat {
  border-width: 1px;
  border-style: solid;
  cursor: pointer;

  &--primary {
    background-color: var(--color-primary-normal);
    border-color: var(--color-primary-border);

    &:hover {
      background-color: var(--color-primary-hover);
    }

    &:active {
      background-color: var(--color-primary-active);
    }
  }

  &--secondary {
    background-color: var(--color-secondary-normal);
    border-color: var(--color-secondary-border);

    &:hover {
      background-color: var(--color-secondary-hover);
    }

    &:active {
      background-color: var(--color-secondary-active);
    }
  }

  &--round-left {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }

  &--round-right {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}
</style>
