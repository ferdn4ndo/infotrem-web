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

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage ?? null
  } catch {
    return null
  }
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

  let storedTheme: string | null
  try {
    storedTheme = getLocalStorage()?.getItem(THEME_STORAGE_KEY) ?? null
  } catch {
    storedTheme = null
  }
  const nextTheme: Theme =
    storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : getPreferredTheme()

  setTheme(nextTheme)
  initialized = true
}

function toggleTheme() {
  const nextTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
  setTheme(nextTheme)

  try {
    getLocalStorage()?.setItem(THEME_STORAGE_KEY, nextTheme)
  } catch {
    // Persistence is best-effort; ignore storage failures.
  }
}

export function useTheme() {
  return {
    theme: readonly(theme),
    initTheme,
    toggleTheme
  }
}
