<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import AppButton from '@/components/common/AppButton.vue'

export interface ConfirmDialogProps {
  modelValue: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  title: 'Confirmar ação',
  message: 'Tem certeza que deseja continuar?',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const dialogRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)
const cancelRef = ref<InstanceType<typeof AppButton> | null>(null)
const confirmRef = ref<InstanceType<typeof AppButton> | null>(null)
const titleId = `confirm-dialog-title-${Math.random().toString(16).slice(2)}`

let previousFocus: HTMLElement | null = null
let blockedElements: HTMLElement[] = []

const focusTargets = computed(() =>
  [cancelRef.value?.$el, confirmRef.value?.$el].filter((element): element is HTMLElement =>
    Boolean(element)
  )
)

function closeWithCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

function closeWithConfirm() {
  emit('update:modelValue', false)
  emit('confirm')
}

function restoreFocus() {
  previousFocus?.focus()
  previousFocus = null
}

function setBackgroundBlocked(blocked: boolean) {
  if (blocked) {
    const overlay = overlayRef.value
    const parent = overlay?.parentElement
    if (!parent) {
      return
    }
    blockedElements = Array.from(parent.children).filter(
      (element): element is HTMLElement => element !== overlay && element instanceof HTMLElement
    )
    for (const element of blockedElements) {
      element.setAttribute('aria-hidden', 'true')
      element.setAttribute('inert', '')
    }
    return
  }

  for (const element of blockedElements) {
    element.removeAttribute('aria-hidden')
    element.removeAttribute('inert')
  }
  blockedElements = []
}

function trapFocus(event: KeyboardEvent) {
  if (!props.modelValue) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeWithCancel()
    return
  }

  if (event.key !== 'Tab') {
    return
  }

  const targets = focusTargets.value
  if (targets.length === 0) {
    return
  }

  const first = targets[0]
  const last = targets[targets.length - 1]
  const active = document.activeElement

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      previousFocus = document.activeElement as HTMLElement | null
      await nextTick()
      setBackgroundBlocked(true)
      const targets = focusTargets.value
      targets[0]?.focus()
      return
    }

    await nextTick()
    setBackgroundBlocked(false)
    restoreFocus()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  setBackgroundBlocked(false)
  restoreFocus()
})
</script>

<template>
  <div v-if="modelValue" ref="overlayRef" class="ConfirmDialog-Overlay" @keydown="trapFocus">
    <section
      ref="dialogRef"
      class="ConfirmDialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
    >
      <h2 :id="titleId" class="ConfirmDialog-Title">{{ title }}</h2>
      <p class="ConfirmDialog-Message">{{ message }}</p>
      <div class="ConfirmDialog-Actions">
        <AppButton ref="cancelRef" variant="ghost" @click="closeWithCancel">
          {{ cancelLabel }}
        </AppButton>
        <AppButton ref="confirmRef" variant="danger" @click="closeWithConfirm">
          {{ confirmLabel }}
        </AppButton>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.ConfirmDialog-Overlay {
  position: fixed;
  inset: 0;
  z-index: $z-index-d;
  display: grid;
  place-items: center;
  padding: var(--space-4);
  background: rgb(0 0 0 / 50%);
}

.ConfirmDialog {
  width: min(100%, 520px);
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: $radius-md;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);

  &-Title {
    margin: 0;
    font-size: var(--font-size-lg);
    color: var(--color-heading);
  }

  &-Message {
    margin: 0;
    color: var(--color-text);
  }

  &-Actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
  }
}
</style>
