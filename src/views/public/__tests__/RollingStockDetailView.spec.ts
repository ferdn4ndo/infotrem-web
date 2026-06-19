import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RollingStockDetailView from '@/views/public/RollingStockDetailView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { id: 'stock-1' } },
  getRollingStockSummary: vi.fn(),
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
  getRollingStockSummary: mocks.getRollingStockSummary
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

describe('RollingStockDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findResource.mockReturnValue({ key: 'rolling-stock', relations: [] })
    mocks.getResource.mockResolvedValue({ id: 'resolved', short_name: 'Resolver' })
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })
  })

  it('renders summary data and resolves manufacturer/gauge labels', async () => {
    mocks.getRollingStockSummary.mockResolvedValue({
      rolling_stock: {
        id: 'stock-1',
        painted_identifier: 'CPTM 1001',
        type: 'car',
        manufacturer_id: 'manufacturer-1',
        gauge_id: 'gauge-1'
      },
      freight_car: [{ id: 'freight-1' }],
      information: [{ id: 'info-1', title: 'Detalhe' }]
    })
    mocks.getResource
      .mockResolvedValueOnce({ id: 'manufacturer-1', short_name: 'GE' })
      .mockResolvedValueOnce({ id: 'gauge-1', code: '1600mm' })

    const wrapper = mount(RollingStockDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('CPTM 1001')
    expect(wrapper.text()).toContain('Freight car')
    expect(wrapper.text()).toContain('GE')
    expect(wrapper.text()).toContain('1600mm')
  })

  it('shows loading state while summary is pending', () => {
    mocks.getRollingStockSummary.mockImplementation(
      () => new Promise(() => {}) as ReturnType<typeof mocks.getRollingStockSummary>
    )
    const wrapper = mount(RollingStockDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })

    expect(wrapper.text()).toContain('Carregando material rodante...')
  })

  it('shows fallback error when both summary and fallback calls fail', async () => {
    mocks.getRollingStockSummary.mockRejectedValue(new Error('summary down'))
    mocks.getResource.mockRejectedValue(new Error('fallback down'))

    const wrapper = mount(RollingStockDetailView, {
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
