import { readonly, ref } from 'vue'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'infotrem-theme'
const theme = ref<Theme>('light')
let initialized = false

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function setTheme(nextTheme: Theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  theme.value = nextTheme
}

function initTheme() {
  if (initialized) {
    return
  }

  const storedTheme =
    typeof window !== 'undefined' ? window.localStorage.getItem(THEME_STORAGE_KEY) : null
  const nextTheme: Theme =
    storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : getPreferredTheme()

  setTheme(nextTheme)
  initialized = true
}

function toggleTheme() {
  const nextTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
  setTheme(nextTheme)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }
}

export function useTheme() {
  return {
    theme: readonly(theme),
    initTheme,
    toggleTheme
  }
}
