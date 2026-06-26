<script setup lang="ts">
export interface AppCheckboxProps {
  modelValue?: boolean
  id?: string
  name?: string
  disabled?: boolean
  required?: boolean
  ariaDescribedby?: string
}

withDefaults(defineProps<AppCheckboxProps>(), {
  modelValue: false,
  id: undefined,
  name: undefined,
  disabled: false,
  required: false,
  ariaDescribedby: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <input
    class="AppCheckbox"
    :checked="modelValue"
    :id="id"
    :name="name"
    type="checkbox"
    :disabled="disabled"
    :required="required"
    :aria-describedby="ariaDescribedby"
    @change="onChange"
  />
</template>

<style scoped lang="scss">
.AppCheckbox {
  inline-size: 18px;
  block-size: 18px;
  accent-color: var(--color-primary-border);

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-border);
    outline-offset: 2px;
  }
}
</style>
