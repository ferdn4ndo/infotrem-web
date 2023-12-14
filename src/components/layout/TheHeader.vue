<script setup lang="ts">
import ButtonFlat from '@/components/input/ButtonFlat.vue'
import TextInput from '@/components/input/TextInput.vue'
import ProfileToolbar from '@/components/layout/ProfileToolbar.vue'
import { ref } from 'vue'

defineProps<{
  msg: string
}>()

const searchBarText = ref('')

const emit = defineEmits<{
  (e: 'menuButtonClick'): void
}>()

function handleMenuButtonClick() {
  console.log('Menu button clicked')
  emit('menuButtonClick')
}

function isDarkMode() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true
  }

  return false
}
</script>

<template>
  <header class="TheHeader">
    <div class="TheHeader-LeftContainer">
      <button-flat
        class="TheHeader-Button"
        scheme="secondary"
        icon="fa-solid fa-bars"
        @click="handleMenuButtonClick"
      />

      <img v-if="isDarkMode()" alt="InfoTrem logo" class="TheHeader-Logo" src="/logo-dark-bg.svg" />
      <img v-else alt="InfoTrem logo" class="TheHeader-Logo" src="/logo-light-bg.svg" />
    </div>

    <div class="TheHeader-CentralContainer">
      <TextInput
        v-model="searchBarText"
        placeholder="Procurar (ex: G12 3669, FNB 629692-1, ZPV, etc)"
        id="textSearchBar"
        name="textSearchBar"
        :display-button="true"
        button-icon="fa-solid fa-magnifying-glass"
        button-side="right"
      />
    </div>

    <div class="TheHeader-RightContainer">
      <ProfileToolbar />
    </div>
  </header>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.TheHeader {
  position: fixed;
  top: 0;
  height: 60px;
  width: 100%;

  color: var(--color-heading);

  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);

  display: flex;
  justify-content: space-between;
  align-items: center;

  z-index: 999;

  &-LeftContainer {
    justify-self: flex-start;
    display: flex;
    align-items: center;
  }

  &-CentralContainer {
    flex: 1 1 100%;
    margin: 0 50px;
  }

  &-RightContainer {
    justify-self: flex-end;
  }

  &-Title {
    display: inline-block;
  }

  &-Logo {
    height: 30px;
  }

  &-Button {
    margin: 10px;
    height: 30px;
  }

  &-LinksWrapper {
    display: inline-block;
  }
}
</style>
