import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SigoSeriesManager from '@/components/common/SigoSeriesManager.vue'

const mocks = vi.hoisted(() => ({
  findResource: vi.fn()
}))

vi.mock('@/services/api/resources', () => ({
  findResource: mocks.findResource
}))

describe('SigoSeriesManager', () => {
  it('renders the relation manager when sigo-series relation is configured', () => {
    mocks.findResource.mockReturnValue({
      key: 'information',
      relations: [{ key: 'sigo-series', pathSuffix: 'sigo-series', label: 'Séries SIGO' }]
    })

    const wrapper = mount(SigoSeriesManager, {
      props: { informationId: 'info-1' },
      global: {
        stubs: {
          RelationManager: { template: '<div data-test="relation-manager" />' }
        }
      }
    })

    expect(wrapper.text()).toContain('Séries SIGO')
    expect(wrapper.find('[data-test="relation-manager"]').exists()).toBe(true)
  })

  it('shows an error message when relation metadata is missing', () => {
    mocks.findResource.mockReturnValue(null)

    const wrapper = mount(SigoSeriesManager, {
      props: { informationId: 'info-1' }
    })

    expect(wrapper.text()).toContain('Configuração de séries SIGO indisponível no frontend.')
  })
})
