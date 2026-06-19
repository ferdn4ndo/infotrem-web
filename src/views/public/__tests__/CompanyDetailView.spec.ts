import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CompanyDetailView from '@/views/public/CompanyDetailView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { id: 'company-1' } },
  getCompanySummary: vi.fn(),
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
  getCompanySummary: mocks.getCompanySummary
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

describe('CompanyDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findResource.mockImplementation((key: string) => ({ key, relations: [] }))
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })
  })

  it('renders summary data when aggregate endpoint succeeds', async () => {
    mocks.getCompanySummary.mockResolvedValue({
      company: { id: 'company-1', name: 'Rumo', abbrev: 'RMO' },
      information: [{ id: 'info-1', title: 'Histórico' }],
      paint_schemes: [{ id: 'paint-1', name: 'Pintura A' }],
      counts: { information_count: 1, paint_schemes_count: 1 }
    })

    const wrapper = mount(CompanyDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Rumo')
    expect(wrapper.text()).toContain('RMO')
    expect(wrapper.text()).toContain('Informações')
    expect(wrapper.text()).toContain('Pinturas')
  })

  it('shows loading state while summary request is pending', async () => {
    mocks.getCompanySummary.mockImplementation(
      () => new Promise(() => {}) as ReturnType<typeof mocks.getCompanySummary>
    )

    const wrapper = mount(CompanyDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })

    expect(wrapper.text()).toContain('Carregando empresa...')
  })

  it('falls back to base resources when summary fails', async () => {
    mocks.getCompanySummary.mockRejectedValue(new Error('summary down'))
    mocks.getResource.mockResolvedValue({ id: 'company-1', name: 'Fallback Co' })
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })

    const wrapper = mount(CompanyDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' }
        }
      }
    })
    await flushPromises()

    expect(mocks.getResource).toHaveBeenCalledWith('/companies', 'company-1')
    expect(wrapper.text()).toContain('Fallback Co')
  })
})
