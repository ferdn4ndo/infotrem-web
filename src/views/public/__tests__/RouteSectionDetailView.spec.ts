import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RouteSectionDetailView from '@/views/public/RouteSectionDetailView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { routeId: 'route-1', sectionId: 'section-1' } },
  auth: { isStaff: true, isAdmin: false, isLoggedIn: true, user: { id: 'staff-1' } },
  getResource: vi.fn(),
  listNested: vi.fn(),
  getRouteTree: vi.fn()
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route
  }
})

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

vi.mock('@/services/api/resources.api', () => ({
  getResource: mocks.getResource
}))

vi.mock('@/services/api/social.api', () => ({
  listNested: mocks.listNested
}))

vi.mock('@/services/api/summary.api', () => ({
  getRouteTree: mocks.getRouteTree
}))

describe('RouteSectionDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getResource.mockResolvedValue({ id: 'section-1', name: 'Trecho A', status: 'active' })
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })
    mocks.getRouteTree.mockResolvedValue({
      sections: [
        {
          id: 'section-1',
          locations: [
            { id: 'section-location-1', location_id: 'location-1', location_route_order: 1 }
          ],
          paths: []
        }
      ]
    })
    mocks.auth.isStaff = true
  })

  it('renders section data and nested management for staff', async () => {
    const wrapper = mount(RouteSectionDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section data-test="relation-manager" />' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Seção da rota')
    expect(wrapper.text()).toContain('Trecho A')
    expect(wrapper.findAll('[data-test="relation-manager"]').length).toBeGreaterThan(0)
  })

  it('hides nested write managers for non-staff users', async () => {
    mocks.auth.isStaff = false
    const wrapper = mount(RouteSectionDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section data-test="relation-manager" />' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.find('[data-test="relation-manager"]').exists()).toBe(false)
  })

  it('shows error when section request fails', async () => {
    mocks.getResource.mockRejectedValue(new Error('section down'))

    const wrapper = mount(RouteSectionDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('section down')
  })
})
