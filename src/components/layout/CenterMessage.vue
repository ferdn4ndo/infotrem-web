<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
// import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <main class="CenterMessage">
    <slot />
  </main>
</template>

<style lang="scss" scoped>
.CenterMessage {
  line-height: 1.5;
  max-height: 100vh;

  @media (min-width: $breakpoint-large) {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}
</style>
