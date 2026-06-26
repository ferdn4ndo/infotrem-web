<script setup lang="ts">
export interface AppInputProps {
  modelValue?: string | number | null
  id?: string
  name?: string
  type?: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  required?: boolean
  ariaInvalid?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  ariaDescribedby?: string
}

withDefaults(defineProps<AppInputProps>(), {
  modelValue: '',
  id: undefined,
  name: undefined,
  type: 'text',
  placeholder: undefined,
  autocomplete: undefined,
  disabled: false,
  required: false,
  ariaInvalid: undefined,
  ariaDescribedby: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    class="AppInput"
    :value="modelValue ?? ''"
    :id="id"
    :name="name"
    :type="type"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :disabled="disabled"
    :required="required"
    :aria-invalid="ariaInvalid"
    :aria-describedby="ariaDescribedby"
    @input="onInput"
  />
</template>

<style scoped lang="scss">
.AppInput {
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
