import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PathPointSummaryCard from '@/components/common/PathPointSummaryCard.vue'
import RollingStockSummaryCard from '@/components/common/RollingStockSummaryCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import RouteSectionLocationSummaryCard from '@/components/common/RouteSectionLocationSummaryCard.vue'

const mocks = vi.hoisted(() => ({
  getRollingStockSummary: vi.fn(),
  getLocationSummary: vi.fn(),
  getResource: vi.fn()
}))

vi.mock('@/services/api/summary.api', () => ({
  getRollingStockSummary: mocks.getRollingStockSummary,
  getLocationSummary: mocks.getLocationSummary
}))

vi.mock('@/services/api/resources.api', () => ({
  getResource: mocks.getResource
}))

describe('summary cards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getRollingStockSummary.mockResolvedValue({})
    mocks.getLocationSummary.mockResolvedValue({})
    mocks.getResource.mockResolvedValue({})
  })

  it('renders path point order and coordinates', () => {
    const wrapper = mount(PathPointSummaryCard, {
      props: {
        item: { id: 'point-1', order: 3, latitude: -23.5, longitude: -46.6 }
      }
    })

    expect(wrapper.text()).toContain('Ponto 3')
    expect(wrapper.text()).toContain('-23.5')
    expect(wrapper.text()).toContain('-46.6')
  })

  it('renders rolling stock identifiers', () => {
    mocks.getRollingStockSummary.mockResolvedValue({
      manufacturer_name: 'GE',
      gauge_name: 'Métrica'
    })
    const wrapper = mount(RollingStockSummaryCard, {
      props: {
        item: {
          id: 'rs-1',
          painted_identifier: 'ABC 1234',
          type: 'locomotive',
          manufacturer_id: 'manufacturer-1',
          gauge_id: 'gauge-1'
        }
      }
    })
    return flushPromises().then(() => {
      expect(wrapper.text()).toContain('ABC 1234')
      expect(wrapper.text()).toContain('locomotive')
      expect(wrapper.text()).toContain('Bitola Métrica')
      expect(wrapper.text()).toContain('Fabricante GE')
    })
  })

  it('renders route section location kilometers', () => {
    mocks.getLocationSummary.mockResolvedValue({
      location: { name: 'Pátio Campinas' }
    })
    const wrapper = mount(RouteSectionLocationSummaryCard, {
      props: {
        item: { id: 'relation-1', location_id: 'location-1', location_route_order: 2 },
        kilometers: [{ id: 'km-1', kilometer: '12.5' }]
      },
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })
    return flushPromises().then(() => {
      expect(wrapper.text()).toContain('Ordem 2')
      expect(wrapper.text()).toContain('Local Pátio Campinas')
      expect(wrapper.text()).toContain('km 12.5')
    })
  })

  it('uses entity routing when a target is available', () => {
    const wrapper = mount(RoutableEntitySummaryCard, {
      props: {
        item: { id: 'media-1', entity_type: 'media', title: 'Mídia roteável' }
      },
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Mídia roteável')
    expect(wrapper.find('a').exists()).toBe(true)
  })
})
