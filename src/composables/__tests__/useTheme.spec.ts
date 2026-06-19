import { beforeEach, describe, expect, it, vi } from 'vitest'

const THEME_STORAGE_KEY = 'infotrem-theme'

async function loadComposable() {
  vi.resetModules()
  return import('@/composables/useTheme')
}

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    vi.unstubAllGlobals()
  })

  it('uses prefers-color-scheme when no preference is stored', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })
    )
    const { useTheme } = await loadComposable()

    const { initTheme, theme } = useTheme()
    initTheme()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('prefers stored theme over media query', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })
    )
    const { useTheme } = await loadComposable()

    const { initTheme, theme } = useTheme()
    initTheme()

    expect(theme.value).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('toggles theme and persists the new value', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })
    )
    const { useTheme } = await loadComposable()

    const { initTheme, theme, toggleTheme } = useTheme()
    initTheme()
    toggleTheme()

    expect(theme.value).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })
})
