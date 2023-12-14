<script setup lang="ts">
import TheHeader from '@/components/layout/TheHeader.vue'
import SideMenu from './components/layout/SideMenu.vue'
import { ref } from 'vue'

const showSideMenu = ref(false)

function handleHeaderMenuButtonClick() {
  showSideMenu.value = !showSideMenu.value
  console.log(`new show side menu value: ${showSideMenu.value}`)
}
</script>

<template>
  <TheHeader msg="Foo" class="MainHeader" @menu-button-click="handleHeaderMenuButtonClick" />

  <Transition name="slide-fade">
    <SideMenu v-if="showSideMenu" />
  </Transition>

  <RouterView class="MainContent" />
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.MainContent {
  margin-top: 60px;
}
</style>
