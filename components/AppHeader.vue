<template>
  <v-app-bar :clipped-left="true" fixed app>
    <v-app-bar-nav-icon @click.stop="handleShowMenuClick" />

    <img
      v-if="isDarkMode()"
      class="AppHeader-Logo"
      alt="InfoTrem Logo"
      src="/logo-dark-bg.svg"
    />

    <img
      v-else
      class="AppHeader-Logo"
      alt="InfoTrem Logo"
      src="/logo-light-bg.svg"
    />

    <v-spacer class="hidden-md-and-down" />

    <v-btn icon class="hidden-lg-and-up" @click.stop="clickSearchIcon">
      <v-icon>fas fa-magnifying-glass</v-icon>
    </v-btn>

    <v-text-field
      v-model="searchFieldText"
      class="AppHeader-SearchField hidden-md-and-down"
      label="Buscar"
      append-icon="fas fa-magnifying-glass"
      @click:append-outer="clickSearchButton"
    />

    <v-spacer class="hidden-md-and-down" />

    <v-btn icon @click.stop="handleShowProfileClick">
      <v-icon>mdi-account-box</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTheme } from 'vuetify'

const emit = defineEmits<{
  (e: 'toggle-show-profile'): void
  (e: 'toggle-show-menu'): void
}>()

const searchFieldText = ref('')

function handleShowMenuClick() {
  emit('toggle-show-menu');
}

function handleShowProfileClick() {
  emit('toggle-show-profile');
}

function clickSearchIcon() {
  alert('search icon clicked');
}

function clickSearchButton() {
  alert('search button clicked');
}

function isDarkMode(): boolean {
  const theme = useTheme()

  return theme.global.current.value.dark
}
</script>

<style lang="scss" scoped>
.AppHeader {
  &-SearchField {
    margin-top: 25px;
  }

  &-Logo {
    height: 30px;
    margin: 5px;
    padding-left: 20px;
  }
}
</style>
