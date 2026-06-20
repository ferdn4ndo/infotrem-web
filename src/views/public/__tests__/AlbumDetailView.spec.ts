import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AlbumDetailView from '@/views/public/AlbumDetailView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { id: 'album-1' } },
  auth: { isLoggedIn: true, isStaff: false, isAdmin: false, user: { id: 'user-1' } },
  getAlbumDetail: vi.fn(),
  getAlbum: vi.fn(),
  getSocialSummary: vi.fn(),
  listNested: vi.fn(),
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

vi.mock('@/services/api/albums.api', () => ({
  getAlbum: mocks.getAlbum,
  getAlbumDetail: mocks.getAlbumDetail
}))

vi.mock('@/services/api/media.api', () => ({
  MEDIA_FALLBACK_LOGO_URL: 'https://fallback.test/image.jpg',
  mediaThumbnailUrl: vi.fn((item: Record<string, unknown>) => String(item.thumbnail_url ?? '')),
  toFallbackImage: vi.fn()
}))

vi.mock('@/services/api/social.api', () => ({
  createNested: mocks.createNested,
  createNestedComment: vi.fn(),
  deleteSocialRelation: mocks.deleteSocialRelation,
  getSocialSummary: mocks.getSocialSummary,
  listNested: mocks.listNested
}))

describe('AlbumDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.isLoggedIn = true
    mocks.auth.isStaff = false
    mocks.getAlbumDetail.mockResolvedValue({
      album: { id: 'album-1', title: 'Álbum de teste' },
      social_summary: { likes_count: 2, favorites_count: 1, liked: false, favorited: false },
      media: [],
      comments: []
    })
    mocks.getAlbum.mockResolvedValue({ id: 'album-1', title: 'Fallback' })
    mocks.getSocialSummary.mockResolvedValue({ likes_count: 0, favorites_count: 0 })
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })
  })

  it('shows loading and then renders aggregate album data', async () => {
    let resolveDetail!: (value: Record<string, unknown>) => void
    mocks.getAlbumDetail.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveDetail = resolve
        })
    )

    const wrapper = mount(AlbumDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: {
            props: ['relation', 'canManage'],
            template:
              '<div :data-cy="`relation-${relation.key}`">manage={{ String(canManage) }}</div>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Carregando álbum...')

    resolveDetail({
      album: { id: 'album-1', title: 'Álbum de teste' },
      social_summary: { likes_count: 2, favorites_count: 1, liked: false, favorited: false },
      media: [],
      comments: []
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Álbum de teste')
    expect(wrapper.text()).toContain('Curtir')
  })

  it('shows unauthenticated interaction CTA when logged out', async () => {
    mocks.auth.isLoggedIn = false

    const wrapper = mount(AlbumDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: {
            props: ['relation', 'canManage'],
            template:
              '<div :data-cy="`relation-${relation.key}`">manage={{ String(canManage) }}</div>'
          }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Entre para interagir')
    expect(wrapper.find('[data-cy="album-like"]').exists()).toBe(false)
  })

  it('shows error when detail and fallback fail', async () => {
    mocks.getAlbumDetail.mockRejectedValueOnce(new Error('detail fail'))
    mocks.getAlbum.mockRejectedValueOnce(new Error('fallback fail'))

    const wrapper = mount(AlbumDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: {
            props: ['relation', 'canManage'],
            template:
              '<div :data-cy="`relation-${relation.key}`">manage={{ String(canManage) }}</div>'
          }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('fallback fail')
  })

  it('runs like primary action', async () => {
    const wrapper = mount(AlbumDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: {
            props: ['relation', 'canManage'],
            template:
              '<div :data-cy="`relation-${relation.key}`">manage={{ String(canManage) }}</div>'
          }
        }
      }
    })
    await flushPromises()

    await wrapper.get('[data-cy="album-like"]').trigger('click')

    expect(mocks.createNested).toHaveBeenCalledWith('/albums/album-1', 'likes')
  })

  it('gates album media membership management to staff', async () => {
    const wrapper = mount(AlbumDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: {
            props: ['relation', 'canManage'],
            template:
              '<div :data-cy="`relation-${relation.key}`">manage={{ String(canManage) }}</div>'
          }
        }
      }
    })
    await flushPromises()

    expect(wrapper.get('[data-cy="relation-media"]').text()).toContain('manage=false')

    mocks.auth.isStaff = true
    const staffWrapper = mount(AlbumDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: {
            props: ['relation', 'canManage'],
            template:
              '<div :data-cy="`relation-${relation.key}`">manage={{ String(canManage) }}</div>'
          }
        }
      }
    })
    await flushPromises()

    expect(staffWrapper.get('[data-cy="relation-media"]').text()).toContain('manage=true')
  })
})
