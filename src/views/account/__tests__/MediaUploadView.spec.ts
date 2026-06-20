import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MediaUploadView from '@/views/account/MediaUploadView.vue'

const mocks = vi.hoisted(() => ({
  listResource: vi.fn(),
  createMedia: vi.fn(),
  uploadMediaFile: vi.fn(),
  uploadMediaFromUrl: vi.fn(),
  getMedia: vi.fn()
}))

vi.mock('@/services/api/resources.api', () => ({
  listResource: mocks.listResource
}))

vi.mock('@/services/api/media.api', () => ({
  createMedia: mocks.createMedia,
  uploadMediaFile: mocks.uploadMediaFile,
  uploadMediaFromUrl: mocks.uploadMediaFromUrl,
  getMedia: mocks.getMedia
}))

describe('MediaUploadView lookup loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createMedia.mockResolvedValue({ id: 'media-1' })
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

  it('submits lowercase media status contract', async () => {
    mocks.listResource.mockResolvedValue({ items: [], count: 0 })

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

    await wrapper.get('[data-cy="media-title"]').setValue('Mídia')
    const status = wrapper.findAll('select')[0]
    await status.setValue('approved')
    await wrapper.get('[data-cy="media-create-form"]').trigger('submit')
    await flushPromises()

    expect(mocks.createMedia).toHaveBeenCalledWith(expect.objectContaining({ status: 'approved' }))
  })
})
