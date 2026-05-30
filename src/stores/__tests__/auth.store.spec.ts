import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth.store'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  me: vi.fn(),
  register: vi.fn(),
  updateMe: vi.fn(),
  resendEmailValidation: vi.fn()
}))

vi.mock('@/services/api/auth.api', () => mocks)

function installLocalStorageStub() {
  const store = new Map<string, string>()
  const localStorage = {
    clear: vi.fn(() => store.clear()),
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => store.delete(key)),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    get length() {
      return store.size
    }
  } satisfies Storage

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorage
  })
}

describe('auth.store', () => {
  beforeEach(() => {
    installLocalStorageStub()
    setActivePinia(createPinia())
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('hydrates the user and exposes role state after login', async () => {
    mocks.login.mockResolvedValue({ token: 'token-1' })
    mocks.me.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.test',
      is_staff: true,
      is_admin: true
    })

    const auth = useAuthStore()
    await auth.login({ email: 'admin@example.test', password: 'secret' })

    expect(window.localStorage.getItem('infotrem.authToken')).toBe('token-1')
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.isStaff).toBe(true)
    expect(auth.isAdmin).toBe(true)
  })

  it('clears token and user state on logout', () => {
    const auth = useAuthStore()

    auth.setToken('token-1')
    auth.user = {
      id: 'user-1',
      email: 'user@example.test',
      is_staff: false,
      is_admin: false
    }

    auth.logout()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(window.localStorage.getItem('infotrem.authToken')).toBeNull()
  })
})
