import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PathPointSummaryCard from '@/components/common/PathPointSummaryCard.vue'
import RollingStockSummaryCard from '@/components/common/RollingStockSummaryCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import RouteSectionLocationSummaryCard from '@/components/common/RouteSectionLocationSummaryCard.vue'

describe('summary cards', () => {
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
    const wrapper = mount(RollingStockSummaryCard, {
      props: {
        item: {
          id: 'rs-1',
          painted_identifier: 'ABC 1234',
          type: 'locomotive',
          gauge_id: 'gauge-1'
        }
      }
    })

    expect(wrapper.text()).toContain('ABC 1234')
    expect(wrapper.text()).toContain('locomotive')
    expect(wrapper.text()).toContain('Bitola gauge-1')
  })

  it('renders route section location kilometers', () => {
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

    expect(wrapper.text()).toContain('Ordem 2')
    expect(wrapper.text()).toContain('Local location-1')
    expect(wrapper.text()).toContain('km 12.5')
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
