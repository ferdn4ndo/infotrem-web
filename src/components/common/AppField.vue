<script setup lang="ts">
import { computed } from 'vue'

export interface AppFieldProps {
  id?: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<AppFieldProps>(), {
  id: undefined,
  hint: '',
  error: '',
  required: false,
  disabled: false
})

const generatedId = `app-field-${Math.random().toString(16).slice(2)}`

const fieldId = computed(() => props.id || generatedId)
const hintId = computed(() => (props.hint ? `${fieldId.value}-hint` : null))
const errorId = computed(() => (props.error ? `${fieldId.value}-error` : null))
const describedBy = computed(
  () => [hintId.value, errorId.value].filter(Boolean).join(' ') || undefined
)
const ariaInvalid = computed(() => (props.error ? 'true' : undefined))
</script>

<template>
  <div
    class="AppField"
    :class="{ 'AppField--disabled': disabled, 'AppField--invalid': Boolean(error) }"
  >
    <label class="AppField-Label" :for="fieldId">
      <span>{{ label }}</span>
      <span v-if="required" class="AppField-Required" aria-hidden="true">*</span>
    </label>

    <div class="AppField-Control">
      <slot
        :id="fieldId"
        :required="required"
        :disabled="disabled"
        :ariaInvalid="ariaInvalid"
        :ariaDescribedby="describedBy"
      />
    </div>

    <p v-if="hint" :id="hintId ?? undefined" class="AppField-Hint">{{ hint }}</p>
    <p v-if="error" :id="errorId ?? undefined" class="AppField-Error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped lang="scss">
.AppField {
  display: grid;
  gap: var(--space-2);

  &-Label {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-1);
    color: var(--color-heading);
    font-size: var(--font-size-sm);
    font-weight: $font-weight-bold;
    line-height: var(--line-height-tight);
  }

  &-Control {
    display: grid;
    gap: var(--space-1);
  }

  &-Required {
    color: var(--color-danger-normal);
  }

  &-Hint,
  &-Error {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-tight);
  }

  &-Hint {
    color: var(--color-text-secondary);
  }

  &-Error {
    color: var(--color-danger-normal);
  }

  &--disabled {
    opacity: 0.8;
  }
}
</style>
