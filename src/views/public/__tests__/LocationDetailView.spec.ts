import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import LocationDetailView from '@/views/public/LocationDetailView.vue'

const leafletMocks = vi.hoisted(() => {
  const setView = vi.fn()
  const remove = vi.fn()
  const markerRemove = vi.fn()
  return {
    map: vi.fn(() => ({
      setView,
      remove
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => ({ addTo: vi.fn(), remove: markerRemove })),
    setView,
    remove,
    markerRemove
  }
})

const mocks = vi.hoisted(() => ({
  route: { params: { id: 'location-1' } },
  getLocationSummary: vi.fn(),
  getResource: vi.fn(),
  listNested: vi.fn(),
  findResource: vi.fn()
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))
vi.mock('leaflet', () => leafletMocks)

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route
  }
})

vi.mock('@/services/api/summary.api', () => ({
  getLocationSummary: mocks.getLocationSummary
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

describe('LocationDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findResource.mockReturnValue({ key: 'locations', relations: [] })
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })
  })

  it('renders summary data and map container when coordinates are available', async () => {
    mocks.getLocationSummary.mockResolvedValue({
      location: {
        id: 'location-1',
        name: 'Pátio A',
        center_latitude: -22.9,
        center_longitude: -43.2
      },
      information: [{ id: 'info-1', title: 'História' }]
    })

    const wrapper = mount(LocationDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Pátio A')
    expect(wrapper.find('[aria-label="Mapa com posição do local"]').exists()).toBe(true)
  })

  it('shows loading state while summary is pending', () => {
    mocks.getLocationSummary.mockImplementation(
      () => new Promise(() => {}) as ReturnType<typeof mocks.getLocationSummary>
    )

    const wrapper = mount(LocationDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })

    expect(wrapper.text()).toContain('Carregando local...')
  })

  it('shows error when summary and fallback fail', async () => {
    mocks.getLocationSummary.mockRejectedValue(new Error('summary down'))
    mocks.getResource.mockRejectedValue(new Error('fallback down'))

    const wrapper = mount(LocationDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('fallback down')
  })
})
