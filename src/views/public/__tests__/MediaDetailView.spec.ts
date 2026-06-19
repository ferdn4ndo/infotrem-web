import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MediaDetailView from '@/views/public/MediaDetailView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { id: 'media-1' } },
  auth: { isLoggedIn: true, isStaff: false, isAdmin: false, user: { id: 'user-1' } },
  getMediaDetail: vi.fn(),
  getMedia: vi.fn(),
  listMediaRelation: vi.fn(),
  getSocialSummary: vi.fn(),
  createNested: vi.fn(),
  deleteSocialRelation: vi.fn()
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route
  }
})

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

vi.mock('@/services/api/media.api', () => ({
  MEDIA_FALLBACK_LOGO_URL: 'https://fallback.test/image.jpg',
  getMediaDetail: mocks.getMediaDetail,
  getMedia: mocks.getMedia,
  listMediaRelation: mocks.listMediaRelation,
  createMediaDownload: vi.fn(),
  isVideoMedia: vi.fn(() => false),
  mediaPreviewUrl: vi.fn((item: Record<string, unknown>) => String(item.thumbnail_url ?? '')),
  mediaRawUrl: vi.fn(() => 'https://download.test/file'),
  toFallbackImage: vi.fn()
}))

vi.mock('@/services/api/social.api', () => ({
  createNested: mocks.createNested,
  createNestedComment: vi.fn(),
  deleteSocialRelation: mocks.deleteSocialRelation,
  getSocialSummary: mocks.getSocialSummary
}))

describe('MediaDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.isLoggedIn = true
    mocks.getMediaDetail.mockResolvedValue({
      media: { id: 'media-1', title: 'Mídia de teste', location_id: 'location-1' },
      social_summary: { likes_count: 1, favorites_count: 0, liked: false, favorited: false },
      comments: [],
      reviews: []
    })
    mocks.getMedia.mockResolvedValue({ id: 'media-1', title: 'fallback' })
    mocks.getSocialSummary.mockResolvedValue({ likes_count: 0, favorites_count: 0 })
    mocks.listMediaRelation.mockResolvedValue({ items: [], count: 0 })
  })

  it('shows loading and then renders aggregate data', async () => {
    let resolveDetail!: (value: Record<string, unknown>) => void
    mocks.getMediaDetail.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveDetail = resolve
        })
    )

    const wrapper = mount(MediaDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Carregando mídia...')

    resolveDetail({
      media: { id: 'media-1', title: 'Mídia de teste' },
      social_summary: { likes_count: 1, favorites_count: 0, liked: false, favorited: false },
      comments: [],
      reviews: []
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Mídia de teste')
    expect(wrapper.text()).toContain('Curtir')
  })

  it('shows login CTA when user is not authenticated', async () => {
    mocks.auth.isLoggedIn = false

    const wrapper = mount(MediaDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Entre para interagir')
    expect(wrapper.find('[data-cy="media-like"]').exists()).toBe(false)
  })

  it('shows error message when detail and fallback fail', async () => {
    mocks.getMediaDetail.mockRejectedValueOnce(new Error('detail down'))
    mocks.getMedia.mockRejectedValueOnce(new Error('fallback down'))

    const wrapper = mount(MediaDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('fallback down')
  })

  it('creates like relation when primary action is clicked', async () => {
    const wrapper = mount(MediaDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })
    await flushPromises()

    await wrapper.get('[data-cy="media-like"]').trigger('click')

    expect(mocks.createNested).toHaveBeenCalledWith('/media/media-1', 'likes')
  })
})
