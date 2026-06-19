<script setup lang="ts">
import ProfileCollapseCard from '@/components/layout/ProfileCollapseCard.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import SideMenu from '@/components/layout/SideMenu.vue'
import { BREAKPOINT_LARGE_PX } from '@/styles/tokens'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRoute } from 'vue-router'

const showSideMenu = ref(false)
const showProfileCollapseCard = ref(false)
const isDesktopViewport = ref(false)
const auth = useAuthStore()
const route = useRoute()

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
  window.addEventListener('keydown', handleEscapeKey)
  auth.refreshMe().catch(() => auth.logout())
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
  window.removeEventListener('keydown', handleEscapeKey)
})

watch(
  () => route.fullPath,
  () => {
    showSideMenu.value = false
    showProfileCollapseCard.value = false
  }
)

const isOverlayDrawerVisible = computed(() => showSideMenu.value && !isDesktopViewport.value)
const isDrawerVisible = computed(() => isDesktopViewport.value || showSideMenu.value)

function syncViewport() {
  isDesktopViewport.value = window.matchMedia(`(min-width: ${BREAKPOINT_LARGE_PX}px)`).matches
}

function handleEscapeKey(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOverlayDrawerVisible.value) {
    showSideMenu.value = false
  }
}

function handleHeaderMenuButtonClick() {
  if (isDesktopViewport.value) {
    return
  }

  showSideMenu.value = !showSideMenu.value
}

function closeSideMenu() {
  showSideMenu.value = false
}

function handleProfileChevronClick() {
  showProfileCollapseCard.value = !showProfileCollapseCard.value
}
</script>

<template>
  <TheHeader
    class="MainContent-Header"
    :show-menu-button="!isDesktopViewport"
    :is-profile-collapse-opened="showProfileCollapseCard"
    @menu-button-click="handleHeaderMenuButtonClick"
    @profile-chevron-click="handleProfileChevronClick"
  />

  <Transition name="fade">
    <button
      v-if="isOverlayDrawerVisible"
      type="button"
      class="MainContent-Backdrop"
      aria-label="Fechar menu"
      @click="closeSideMenu"
    />
  </Transition>

  <Transition name="slide-fade">
    <SideMenu v-if="isDrawerVisible" @navigate="closeSideMenu" />
  </Transition>

  <Transition name="slide-from-top">
    <ProfileCollapseCard class="MainContent-Collapse" v-if="showProfileCollapseCard" />
  </Transition>

  <main class="MainContent" :class="{ 'MainContent--with-sidebar': isDesktopViewport }">
    <RouterView />
  </main>
</template>

<style lang="scss">
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-from-top-enter-active {
  transition: all 0.3s ease-out;
}

.slide-from-top-leave-active {
  transition: all 0.3s ease-out;
}

.slide-from-top-enter-from,
.slide-from-top-leave-to {
  transform: translateY(calc(-1 * var(--space-3)));
  opacity: 0;
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

<style lang="scss" scoped>
.MainContent {
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));

  &-Header {
    z-index: $z-index-d;
  }

  &-Backdrop {
    position: fixed;
    top: var(--header-height);
    left: 0;
    width: 100%;
    height: calc(100vh - var(--header-height));
    border: none;
    background: rgb(0 0 0 / 35%);
    z-index: $z-index-c;
  }

  &-Collapse {
    z-index: $z-index-d;
    position: fixed;
    top: var(--header-height);
    right: 0;
    width: min(90vw, 300px);
  }

  &--with-sidebar {
    margin-left: min(85vw, 320px);
  }
}
</style>
