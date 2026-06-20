import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ProfileView from '@/views/account/ProfileView.vue'

const mocks = vi.hoisted(() => ({
  listResource: vi.fn(),
  listNested: vi.fn(),
  auth: {
    isLoading: false,
    errorMessage: null,
    isLoggedIn: true,
    isStaff: false,
    isAdmin: false,
    user: {
      id: 'user-1',
      name: 'InfoTrem User',
      username: 'infotrem-user',
      email: 'user@example.test',
      state_id: 'state-1',
      city_id: 'city-1'
    },
    refreshMe: vi.fn().mockResolvedValue(undefined),
    updateProfile: vi.fn().mockResolvedValue(undefined),
    resendEmailValidation: vi.fn().mockResolvedValue({ message: 'ok' })
  }
}))

vi.mock('@/services/api/resources.api', () => ({
  listResource: mocks.listResource
}))

vi.mock('@/services/api/social.api', () => ({
  listNested: mocks.listNested
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

describe('ProfileView lookup loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.errorMessage = null
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })
  })

  it('shows and clears lookup loading status', async () => {
    let resolveStates!: (value: {
      items: Array<{ id: string; name: string }>
      count: number
    }) => void
    const statesPromise = new Promise<{
      items: Array<{ id: string; name: string }>
      count: number
    }>((resolve) => {
      resolveStates = resolve
    })

    mocks.listResource.mockImplementation((path: string) => {
      if (path === '/states') {
        return statesPromise
      }

      return Promise.resolve({ items: [], count: 0 })
    })

    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          AppCard: { template: '<div><slot /></div>' },
          EntityCard: { template: '<div />' },
          EmptyState: { template: '<div />' },
          StatusMessage: { props: ['message'], template: '<p>{{ message }}</p>' }
        }
      }
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Carregando estados e cidades...')

    resolveStates({ items: [{ id: 'state-1', name: 'São Paulo' }], count: 1 })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Carregando estados e cidades...')
  })

  it('shows lookup error when loading states fails', async () => {
    mocks.listResource.mockRejectedValue(new Error('Falha estados'))

    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          AppCard: { template: '<div><slot /></div>' },
          EntityCard: { template: '<div />' },
          EmptyState: { template: '<div />' },
          StatusMessage: { props: ['message'], template: '<p>{{ message }}</p>' }
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Falha estados')
  })

  it('does not fallback to /cities when nested city lookup fails', async () => {
    mocks.listResource.mockResolvedValue({ items: [{ id: 'state-1', name: 'SP' }], count: 1 })
    mocks.listNested.mockRejectedValue(new Error('Falha cidades'))

    const wrapper = mount(ProfileView, {
      global: {
        stubs: {
          AppCard: { template: '<div><slot /></div>' },
          EntityCard: { template: '<div />' },
          EmptyState: { template: '<div />' },
          StatusMessage: { props: ['message'], template: '<p>{{ message }}</p>' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Falha cidades')
    expect(mocks.listResource).not.toHaveBeenCalledWith('/cities', expect.anything())
  })
})
