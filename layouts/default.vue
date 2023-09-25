<template>
  <v-app dark>
    <AppHeader
      @toggle-show-menu="handleShowMenuClick"
      @toggle-show-profile="handleShowProfileClick"
    />

    <AppMenu ref="appMenu" :items="menuItems" />

    <v-main ref="contentContainer" @click.stop="handleContentClick">
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>

    <AppSideBar ref="appSideBar" />
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppMenu from '~/components/AppMenu.vue'
import AppHeader from '~/components/AppHeader.vue'
import AppSideBar from '~/components/AppSideBar.vue'

const menuItems = ref([
  {
    icon: 'mdi:mdi-apps',
    title: 'Welcome',
    path: '/',
  },
  {
    icon: 'mdi:mdi-chart-bubble',
    title: 'Inspire',
    path: '/inspire',
  },
])

const appMenu = ref(null)
const appSideBar = ref(null)

defineProps({
  title: {
    type: String,
    default: 'InfoTrem App v1.0',
  },
})

function handleShowMenuClick() {
  console.log('toggle menu parent call')
  appMenu.value.toggleMenu()
}

function handleShowProfileClick() {
  console.log('show profile click')
  appSideBar.value.toggleSideBar()
}

function handleContentClick() {
  console.log('shrink menu parent call')
  appMenu.value.shrinkMenu()
}
</script>
