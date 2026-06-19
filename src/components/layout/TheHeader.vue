<script setup lang="ts">
import ButtonFlat from '@/components/input/ButtonFlat.vue'
import TextInput from '@/components/input/TextInput.vue'
import ProfileToolbar from '@/components/layout/ProfileToolbar.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { BREAKPOINT_MEDIUM_PX } from '@/styles/tokens'

const router = useRouter()

export interface TheHeaderProps {
  isProfileCollapseOpened: boolean
  showMenuButton?: boolean
}

withDefaults(defineProps<TheHeaderProps>(), {
  isProfileCollapseOpened: false,
  showMenuButton: true
})

const searchBarText = ref('')
const isSmallViewport = ref(false)
const isSearchExpanded = ref(false)

const emit = defineEmits<{
  (e: 'menuButtonClick'): void
  (e: 'profileChevronClick'): void
}>()

function handleMenuButtonClick() {
  emit('menuButtonClick')
}

function handleProfileChevronClick() {
  emit('profileChevronClick')
}

const { theme, toggleTheme } = useTheme()
const isDarkMode = computed(() => theme.value === 'dark')
const themeToggleAriaLabel = computed(() =>
  isDarkMode.value ? 'Ativar tema claro' : 'Ativar tema escuro'
)
const searchToggleAriaLabel = computed(() =>
  isSearchExpanded.value ? 'Fechar campo de busca' : 'Abrir campo de busca'
)
const logoAlt = computed(() => (isDarkMode.value ? 'InfoTrem logo tema escuro' : 'InfoTrem logo'))
const logoSrc = computed(() => (isDarkMode.value ? '/logo-dark-bg.svg' : '/logo-light-bg.svg'))

function syncViewport() {
  isSmallViewport.value = window.matchMedia(`(max-width: ${BREAKPOINT_MEDIUM_PX}px)`).matches
}

function handleSearchSubmit() {
  const q = searchBarText.value.trim()

  if (q) {
    router.push({ name: 'search', query: { q } })
  }

  if (isSmallViewport.value) {
    isSearchExpanded.value = false
  }
}

function handleSearchButtonClick() {
  handleSearchSubmit()
}

function handleSearchToggleClick() {
  isSearchExpanded.value = !isSearchExpanded.value
}

onMounted(() => {
  syncViewport()
  window.addEventListener('resize', syncViewport)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncViewport)
})

const showInlineSearch = computed(() => !isSmallViewport.value)
const showExpandableSearch = computed(() => isSmallViewport.value && isSearchExpanded.value)
</script>

<template>
  <header class="TheHeader" :class="{ 'TheHeader--expanded': showExpandableSearch }">
    <div class="TheHeader-TopRow">
      <div class="TheHeader-LeftContainer">
        <ButtonFlat
          v-if="showMenuButton"
          class="TheHeader-Button"
          scheme="secondary"
          icon="fa-solid fa-bars"
          aria-label="Abrir menu"
          @click="handleMenuButtonClick"
        />
        <img :alt="logoAlt" class="TheHeader-Logo" :src="logoSrc" />
      </div>

      <form
        v-if="showInlineSearch"
        class="TheHeader-CentralContainer"
        @submit.prevent="handleSearchSubmit"
      >
        <TextInput
          v-model="searchBarText"
          placeholder="Procurar (ex: G12 3669, FNB 629692-1, ZPV, etc)"
          id="textSearchBar"
          name="textSearchBar"
          :display-button="true"
          button-icon="fa-solid fa-magnifying-glass"
          button-side="right"
          @click="handleSearchButtonClick"
        />
      </form>

      <div class="TheHeader-RightContainer">
        <button
          v-if="!showInlineSearch"
          class="TheHeader-ThemeButton"
          :aria-label="searchToggleAriaLabel"
          type="button"
          @click="handleSearchToggleClick"
        >
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
        </button>
        <button
          class="TheHeader-ThemeButton"
          :aria-label="themeToggleAriaLabel"
          type="button"
          @click="toggleTheme"
        >
          <font-awesome-icon :icon="isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon'" />
        </button>
        <ProfileToolbar
          @chevron-click="handleProfileChevronClick"
          :is-collapse-opened="isProfileCollapseOpened"
        />
      </div>
    </div>

    <form
      v-if="showExpandableSearch"
      class="TheHeader-MobileSearch"
      @submit.prevent="handleSearchSubmit"
    >
      <TextInput
        v-model="searchBarText"
        placeholder="Procurar (ex: G12 3669, FNB 629692-1, ZPV, etc)"
        id="textSearchBarMobile"
        name="textSearchBarMobile"
        :display-button="true"
        button-icon="fa-solid fa-magnifying-glass"
        button-side="right"
        @click="handleSearchButtonClick"
      />
    </form>
  </header>
</template>

<style lang="scss" scoped>
.TheHeader {
  position: fixed;
  top: 0;
  width: 100%;
  color: var(--color-heading);
  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  z-index: $z-index-d;
  padding: var(--space-2) var(--space-3);

  &-TopRow {
    min-height: calc(var(--header-height) - (2 * var(--space-2)));
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  &-LeftContainer {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 0 0 auto;
  }

  &-CentralContainer {
    flex: 1 1 auto;
    min-width: 220px;
    max-width: 720px;
  }

  &-RightContainer {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    flex: 0 0 auto;
  }

  &-Logo {
    height: 30px;
    max-width: 140px;
    object-fit: contain;
  }

  &-Button,
  &-ThemeButton {
    height: 30px;
    width: 30px;
  }

  &-ThemeButton {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    border-radius: 5px;
    background-color: var(--color-secondary-normal);
    color: var(--color-heading);
    cursor: pointer;

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
  }

  &-MobileSearch {
    margin-top: var(--space-2);
  }

  @media (max-width: $breakpoint-medium) {
    &-TopRow {
      gap: var(--space-1);
    }
  }

  @media (min-width: $breakpoint-large) {
    padding: var(--space-2) var(--space-4);
  }
}
</style>
