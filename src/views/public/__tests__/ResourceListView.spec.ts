import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ResourceListView from '@/views/public/ResourceListView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { resource: 'media' } },
  routerPush: vi.fn(),
  listResource: vi.fn(),
  auth: { isLoggedIn: true, isStaff: true, isAdmin: false }
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route,
    useRouter: () => ({ push: mocks.routerPush })
  }
})

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

vi.mock('@/services/api/resources.api', () => ({
  listResource: mocks.listResource
}))

describe('ResourceListView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.isLoggedIn = true
    mocks.auth.isStaff = true
    mocks.listResource.mockResolvedValue({
      items: [{ id: 'media-1', title: 'Mídia 1' }],
      count: 1
    })
  })

  it('shows loading and then loaded rows', async () => {
    let resolveList!: (value: {
      items: Array<{ id: string; title: string }>
      count: number
    }) => void
    mocks.listResource.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveList = resolve
        })
    )

    const wrapper = mount(ResourceListView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('aria-label="Carregando registros"')

    resolveList({
      items: [{ id: 'media-1', title: 'Mídia 1' }],
      count: 1
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Mídia')
    expect(wrapper.text()).toContain('1 registro(s)')
  })

  it('shows error state when list call fails', async () => {
    mocks.listResource.mockRejectedValueOnce(new Error('Falha ao listar'))
    const wrapper = mount(ResourceListView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Falha ao listar')
  })

  it('gates create action when user is logged out', async () => {
    mocks.auth.isLoggedIn = false

    const wrapper = mount(ResourceListView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Novo')
  })

  it('routes to detail after create primary action', async () => {
    const wrapper = mount(ResourceListView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          ResourceForm: {
            emits: ['saved', 'cancel'],
            template:
              '<button data-test="emit-saved" @click="$emit(\'saved\', { id: \'media-2\' })" />'
          }
        }
      }
    })
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="emit-saved"]').trigger('click')

    expect(mocks.routerPush).toHaveBeenCalledWith({
      name: 'resource-detail',
      params: { resource: 'media', id: 'media-2' }
    })
  })
})
