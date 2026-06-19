import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OperationsView from '@/views/admin/OperationsView.vue'

const mocks = vi.hoisted(() => ({
  apiGet: vi.fn()
}))

vi.mock('@/services/http/api-client', () => ({
  apiClient: {
    get: mocks.apiGet
  }
}))

describe('OperationsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.apiGet.mockResolvedValue({ status: 'ok', message: 'UP' })
  })

  it('shows loading and health data from mounted request', async () => {
    let resolveHealth!: (value: Record<string, string>) => void
    mocks.apiGet.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveHealth = resolve
        })
    )
    const wrapper = mount(OperationsView)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Consultando saúde da API')

    resolveHealth({ status: 'ok', message: 'UP' })
    await flushPromises()

    expect(wrapper.text()).toContain('UP')
    expect(wrapper.text()).toContain('Swagger JSON')
  })

  it('shows error state when health endpoint fails', async () => {
    mocks.apiGet.mockRejectedValueOnce(new Error('Falha health'))
    const wrapper = mount(OperationsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Falha health')
  })

  it('re-fetches health using primary action button', async () => {
    const wrapper = mount(OperationsView)
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(mocks.apiGet).toHaveBeenCalledTimes(2)
  })
})
