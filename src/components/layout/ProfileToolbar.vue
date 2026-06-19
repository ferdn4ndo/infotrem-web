<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

export interface ProfileToolbarProps {
  isCollapseOpened: boolean
}

const props = withDefaults(defineProps<ProfileToolbarProps>(), {
  isCollapseOpened: false
})

const emit = defineEmits<{
  (e: 'chevron-click'): void
}>()

const auth = useAuthStore()
const profileName = computed(() => auth.displayName)
const profileAvatarUrl = computed(() => String(auth.user?.avatar_url ?? '/logo-light-bg.svg'))

function handleCollapseClick() {
  emit('chevron-click')
}

function getIcon() {
  return props.isCollapseOpened ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'
}
</script>

<template>
  <button
    class="ProfileToolbar"
    type="button"
    :aria-label="isCollapseOpened ? 'Fechar menu do perfil' : 'Abrir menu do perfil'"
    @click="handleCollapseClick"
  >
    <div class="ProfileToolbar-VisibleWrapper">
      <div class="ProfileToolbar-AvatarWrapper">
        <img
          class="ProfileToolbar-AvatarImage"
          :src="profileAvatarUrl"
          :alt="`Foto do perfil de ${profileName}`"
        />
      </div>

      <div class="ProfileToolbar-DataWrapper">
        <div class="ProfileToolbar-Name">
          {{ profileName }}
        </div>
      </div>

      <div class="ProfileToolbar-ButtonWrapper">
        <Transition name="fade" mode="out-in">
          <font-awesome-icon :key="String(props.isCollapseOpened)" :icon="getIcon()" />
        </Transition>
      </div>
    </div>
  </button>
</template>

<style lang="scss" scoped>
.ProfileToolbar {
  height: 40px;
  margin: var(--space-1) var(--space-2);
  position: relative;
  cursor: pointer;
  padding: 0;

  background-color: var(--color-secondary-normal);
  border-color: var(--color-secondary-border);
  border-width: 1px;
  border-style: solid;
  border-radius: 10px;
  color: var(--color-text);

  &:hover {
    background-color: var(--color-secondary-hover);
  }

  &:active {
    background-color: var(--color-secondary-active);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary-border);
    outline-offset: 2px;
  }

  &-VisibleWrapper {
    z-index: $z-index-c;
    position: relative;

    display: flex;
    flex-wrap: nowrap;

    width: auto;
    height: 100%;
  }

  &-AvatarWrapper {
    flex: 0 0 40px;
  }

  &-AvatarImage {
    width: 40px;
    border-radius: 10px;
  }

  &-ButtonWrapper {
    display: flex;
    align-items: center;
    padding-right: var(--space-2);
    margin-left: var(--space-2);
  }

  &-DataWrapper {
    flex: 1 1 auto;
    margin-left: var(--space-2);

    display: none;
    align-items: center;

    @media (min-width: $breakpoint-large) {
      display: flex;
    }
  }

  &-Name {
    font-size: var(--font-size-md);
    text-wrap: nowrap;
  }

  &-Email {
    font-size: 12px;
    color: var(--color-text-secondary);
    text-wrap: nowrap;
  }

  &-Links {
    margin: 2px;
    text-wrap: nowrap;
    text-align: right;
  }

  &-Link {
    font-size: var(--font-size-sm);
    padding: 0 var(--space-1);
    cursor: pointer;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
