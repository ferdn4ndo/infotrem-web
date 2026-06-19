import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MediaUploadView from '@/views/account/MediaUploadView.vue'

const mocks = vi.hoisted(() => ({
  listResource: vi.fn()
}))

vi.mock('@/services/api/resources.api', () => ({
  listResource: mocks.listResource
}))

vi.mock('@/services/api/media.api', () => ({
  createMedia: vi.fn(),
  uploadMediaFile: vi.fn(),
  uploadMediaFromUrl: vi.fn(),
  getMedia: vi.fn()
}))

describe('MediaUploadView lookup loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows and clears locations loading status', async () => {
    let resolveLocations!: (value: {
      items: Array<{ id: string; name: string }>
      count: number
    }) => void
    const locationsPromise = new Promise<{
      items: Array<{ id: string; name: string }>
      count: number
    }>((resolve) => {
      resolveLocations = resolve
    })

    mocks.listResource.mockReturnValue(locationsPromise)

    const wrapper = mount(MediaUploadView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          AppCard: { template: '<div><slot /></div>' },
          EmptyState: { template: '<div />' },
          StatusMessage: { props: ['message'], template: '<p>{{ message }}</p>' }
        }
      }
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Carregando locais...')

    resolveLocations({ items: [{ id: 'location-1', name: 'Pátio Central' }], count: 1 })
    await flushPromises()

    expect(wrapper.text()).not.toContain('Carregando locais...')
  })

  it('shows lookup error when loading locations fails', async () => {
    mocks.listResource.mockRejectedValue(new Error('Falha locais'))

    const wrapper = mount(MediaUploadView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          AppCard: { template: '<div><slot /></div>' },
          EmptyState: { template: '<div />' },
          StatusMessage: { props: ['message'], template: '<p>{{ message }}</p>' }
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Falha locais')
  })
})
