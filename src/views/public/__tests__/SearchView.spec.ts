import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SearchView from '@/views/public/SearchView.vue'

const mocks = vi.hoisted(() => ({
  route: { query: { q: '' } },
  routerPush: vi.fn(),
  search: vi.fn()
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route,
    useRouter: () => ({ push: mocks.routerPush })
  }
})

vi.mock('@/services/api/search.api', () => ({
  search: mocks.search
}))

describe('SearchView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route.query.q = ''
    mocks.search.mockResolvedValue({ q: '', items: [] })
  })

  it('associates the search input with an accessible label', async () => {
    const wrapper = mount(SearchView, {
      global: {
        stubs: {
          RoutableEntitySummaryCard: { template: '<div />' }
        }
      }
    })
    await flushPromises()

    const input = wrapper.get('[data-cy="search-input"]')
    const id = input.attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.get(`label[for="${id}"]`).text()).toContain('Busca')
  })
})
