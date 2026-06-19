import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EntityPicker from '@/components/common/EntityPicker.vue'

const mocks = vi.hoisted(() => ({
  listResource: vi.fn(),
  getResource: vi.fn(),
  search: vi.fn()
}))

vi.mock('@/services/api/resources.api', () => ({
  listResource: mocks.listResource,
  getResource: mocks.getResource
}))

vi.mock('@/services/api/search.api', () => ({
  search: mocks.search
}))

describe('EntityPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mocks.listResource.mockResolvedValue({ items: [], count: 0 })
    mocks.getResource.mockResolvedValue({ id: 'company-1', name: 'Rumo' })
    mocks.search.mockResolvedValue({
      q: 'rumo',
      items: [{ id: 'company-1', name: 'Rumo', entity_type: 'company' }]
    })
  })

  it('debounces search and emits selected id', async () => {
    const wrapper = mount(EntityPicker, {
      props: {
        modelValue: null,
        resourcePath: '/companies',
        entityType: 'company'
      }
    })

    await wrapper.get('input').setValue('rumo')
    await vi.advanceTimersByTimeAsync(300)
    await flushPromises()

    expect(mocks.search).toHaveBeenCalledWith(
      'rumo',
      20,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    await wrapper.get('.EntityPicker-OptionButton').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['company-1']])
    expect(wrapper.emitted('select')).toEqual([['company-1']])
  })

  it('resolves selected name from current id', async () => {
    const wrapper = mount(EntityPicker, {
      props: {
        modelValue: 'company-1',
        resourcePath: '/companies'
      }
    })
    await flushPromises()

    expect(mocks.getResource).toHaveBeenCalledWith(
      '/companies',
      'company-1',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(wrapper.text()).toContain('Selecionado: Rumo')
  })
})
