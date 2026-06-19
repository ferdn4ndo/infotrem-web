import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RouteDetailView from '@/views/public/RouteDetailView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { id: 'route-1' } },
  getRouteTree: vi.fn(),
  getResource: vi.fn(),
  listNested: vi.fn(),
  findResource: vi.fn()
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route
  }
})

vi.mock('@/services/api/summary.api', () => ({
  getRouteTree: mocks.getRouteTree
}))

vi.mock('@/services/api/resources.api', () => ({
  getResource: mocks.getResource
}))

vi.mock('@/services/api/social.api', () => ({
  listNested: mocks.listNested
}))

vi.mock('@/services/api/resources', async () => {
  const actual = await vi.importActual<typeof import('@/services/api/resources')>(
    '@/services/api/resources'
  )
  return {
    ...actual,
    findResource: mocks.findResource
  }
})

describe('RouteDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findResource.mockReturnValue({ key: 'routes', relations: [] })
    mocks.getResource.mockResolvedValue({ id: 'route-1', name: 'Rota fallback' })
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })
  })

  it('renders route tree data', async () => {
    mocks.getRouteTree.mockResolvedValue({
      route: { id: 'route-1', name: 'Rota Norte', status: 'active' },
      sections: [{ id: 'section-1', name: 'Trecho principal' }]
    })

    const wrapper = mount(RouteDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' },
          RouteTree: { template: '<div data-test="route-tree">tree</div>' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Rota Norte')
    expect(wrapper.find('[data-test="route-tree"]').exists()).toBe(true)
  })

  it('shows loading state while route tree request is pending', () => {
    mocks.getRouteTree.mockImplementation(() => new Promise(() => {}) as never)

    const wrapper = mount(RouteDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' },
          RouteTree: { template: '<div />' }
        }
      }
    })

    expect(wrapper.text()).toContain('Carregando rota...')
  })

  it('falls back to route resource and sections list when route tree fails', async () => {
    mocks.getRouteTree.mockRejectedValue(new Error('tree down'))

    const wrapper = mount(RouteDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' },
          RouteTree: { template: '<div />' }
        }
      }
    })
    await flushPromises()

    expect(mocks.getResource).toHaveBeenCalledWith('/routes', 'route-1')
    expect(mocks.listNested).toHaveBeenCalledWith('/routes/route-1', 'sections')
    expect(wrapper.text()).toContain('Rota fallback')
  })
})
