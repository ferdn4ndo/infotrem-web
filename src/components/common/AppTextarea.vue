<script setup lang="ts">
export interface AppTextareaProps {
  modelValue?: string | null
  id?: string
  name?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  ariaInvalid?: boolean | 'true' | 'false' | 'grammar' | 'spelling'
  ariaDescribedby?: string
}

withDefaults(defineProps<AppTextareaProps>(), {
  modelValue: '',
  id: undefined,
  name: undefined,
  placeholder: undefined,
  rows: 4,
  disabled: false,
  required: false,
  ariaInvalid: undefined,
  ariaDescribedby: undefined
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <textarea
    class="AppTextarea"
    :value="modelValue ?? ''"
    :id="id"
    :name="name"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :required="required"
    :aria-invalid="ariaInvalid"
    :aria-describedby="ariaDescribedby"
    @input="onInput"
  />
</template>

<style scoped lang="scss">
.AppTextarea {
  width: 100%;
  min-height: 96px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  font-size: var(--font-size-md);
  line-height: var(--line-height-base);
  background: var(--color-background-soft);
  color: var(--color-text);
  resize: vertical;

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
