<script setup lang="ts">
  import ProfileCollapseCard from '@/components/layout/ProfileCollapseCard.vue'
  import TheHeader from '@/components/layout/TheHeader.vue'
  import SideMenu from './components/layout/SideMenu.vue'
  import { ref } from 'vue'

  const showSideMenu = ref(false);
  const showProfileCollapseCard = ref(false);

  function handleHeaderMenuButtonClick() {
    showSideMenu.value = !showSideMenu.value
    console.log(`new show side menu value: ${showSideMenu.value}`)
  }

  function handleProfileChevronClick() {
    console.log('Profile chevron click')
    showProfileCollapseCard.value = !showProfileCollapseCard.value;
  }
</script>

<template>
  <TheHeader
    msg="Foo"
    class="MainContent-Header"
    :is-profile-collapse-opened="showProfileCollapseCard"
    @menu-button-click="handleHeaderMenuButtonClick"
    @profile-chevron-click="handleProfileChevronClick"
  />

  <Transition name="slide-fade">
    <SideMenu v-if="showSideMenu" />
  </Transition>


  <Transition name="slide-from-top">
    <profile-collapse-card class="MainContent-Collapse" v-if="showProfileCollapseCard">
    </profile-collapse-card>
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
    transform: translateY(-20px);
    opacity: 0;
  }
</style>

<style lang="scss" scoped>
  @import '@/styles/variables.scss';

  .MainContent {
    margin-top: 60px;

    &-Header {
      z-index: $z-index-b;
    }

    &-Collapse {
      z-index: $z-index-a;
      position: fixed;
      top: 60px;
      left: calc(100% - 250px);
    }
  }
</style>
