<script setup lang="ts">
import AppButton from '@/components/common/AppButton.vue'

export interface AppFormActionsProps {
  submitLabel?: string
  cancelLabel?: string
  disableSubmit?: boolean
  disableCancel?: boolean
  showCancel?: boolean
}

withDefaults(defineProps<AppFormActionsProps>(), {
  submitLabel: 'Salvar',
  cancelLabel: 'Cancelar',
  disableSubmit: false,
  disableCancel: false,
  showCancel: true
})

const emit = defineEmits<{
  (e: 'cancel'): void
}>()
</script>

<template>
  <div class="AppFormActions">
    <AppButton type="submit" :disabled="disableSubmit">{{ submitLabel }}</AppButton>
    <AppButton v-if="showCancel" variant="ghost" :disabled="disableCancel" @click="emit('cancel')">
      {{ cancelLabel }}
    </AppButton>
  </div>
</template>

<style scoped lang="scss">
.AppFormActions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
