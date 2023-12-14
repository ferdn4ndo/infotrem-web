<script setup lang="ts">
import ButtonFlat from './ButtonFlat.vue'

export interface TextInputProps {
  buttonIcon?: string
  buttonText?: string
  buttonSide?: 'left' | 'right'
  displayButton?: boolean
  placeholder?: string
  maxLength?: number
  tooltip?: string
  scheme?: string
  id?: string
  name?: string
  modelValue: string
}

withDefaults(defineProps<TextInputProps>(), {
  buttonIcon: undefined,
  buttonText: undefined,
  buttonSide: 'left',
  displayButton: false,
  placeholder: '',
  maxLength: 1024,
  tooltip: '',
  scheme: 'primary',
  id: undefined,
  name: undefined,
  modelValue: ''
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'update:modelValue', target: string): void
}>()

function handleButtonClick() {
  emit('click')
}
</script>

<template>
  <div class="TextInput">
    <ButtonFlat
      v-if="displayButton && buttonSide == 'left'"
      class="TextInput-Button"
      :icon="buttonIcon"
      :scheme="scheme"
      @click="handleButtonClick"
    >
      {{ buttonText }}
    </ButtonFlat>

    <input
      class="TextInput-Input"
      :value="modelValue"
      :id="id"
      :name="name"
      :placeholder="placeholder"
      :maxlength="maxLength"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <ButtonFlat
      v-if="displayButton && buttonSide == 'right'"
      class="TextInput-Button"
      :icon="buttonIcon"
      :scheme="scheme"
      @click="handleButtonClick"
    >
      {{ buttonText }}
    </ButtonFlat>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.TextInput {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;

  &-Button {
    flex: 0 0 auto;
  }

  &-Input {
    flex: 1 1 100%;
    box-sizing: border-box;
    border-radius: 0px;
  }
}
</style>
