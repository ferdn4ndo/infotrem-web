<script setup lang="ts">
type AppSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export interface AppSelectProps {
  modelValue?: string | null
  id?: string
  name?: string
  options?: AppSelectOption[]
  disabled?: boolean
  required?: boolean
  ariaInvalid?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  ariaDescribedby?: string
}

withDefaults(defineProps<AppSelectProps>(), {
  modelValue: '',
  id: undefined,
  name: undefined,
  options: () => [],
  disabled: false,
  required: false,
  ariaInvalid: undefined,
  ariaDescribedby: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<template>
  <select
    class="AppSelect"
    :value="modelValue ?? ''"
    :id="id"
    :name="name"
    :disabled="disabled"
    :required="required"
    :aria-invalid="ariaInvalid"
    :aria-describedby="ariaDescribedby"
    @change="onChange"
  >
    <option
      v-for="option in options"
      :key="`${option.value}::${option.label}`"
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </option>
    <slot />
  </select>
</template>

<style scoped lang="scss">
.AppSelect {
  width: 100%;
  min-height: 36px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  font-size: var(--font-size-md);
  line-height: var(--line-height-tight);
  background: var(--color-background-soft);
  color: var(--color-text);

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
