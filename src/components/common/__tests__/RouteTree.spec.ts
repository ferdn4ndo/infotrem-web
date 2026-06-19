import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import RouteTree from '@/components/common/RouteTree.vue'

describe('RouteTree', () => {
  it('renders route sections with links and nested location cards', () => {
    const wrapper = mount(RouteTree, {
      props: {
        routeId: 'route-1',
        sections: [
          {
            id: 'section-1',
            name: 'Trecho A',
            locations: [
              { id: 'section-location-1', location_id: 'location-1', location_route_order: 1 }
            ],
            paths: [{ id: 'path-1', name: 'Linha 1' }],
            points: [{ id: 'point-1', order: 1, latitude: -10, longitude: -20 }]
          }
        ]
      },
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    })

    expect(wrapper.text()).toContain('Trecho A')
    expect(wrapper.text()).toContain('Abrir seção')
    expect(wrapper.text()).toContain('Local location-1')
    expect(wrapper.text()).toContain('Linha 1')
  })
})
