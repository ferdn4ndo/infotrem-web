import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CommentSection from '@/components/common/CommentSection.vue'

const mocks = vi.hoisted(() => ({
  auth: {
    isLoggedIn: true,
    isStaff: false,
    isAdmin: false,
    user: { id: 'user-1' } as { id: string } | null
  },
  createCommentLike: vi.fn(),
  createNestedComment: vi.fn(),
  deleteCommentLike: vi.fn(),
  deleteNestedComment: vi.fn(),
  getCommentSocialSummary: vi.fn(),
  updateNestedComment: vi.fn()
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

vi.mock('@/services/api/social.api', () => ({
  createCommentLike: mocks.createCommentLike,
  createNestedComment: mocks.createNestedComment,
  deleteCommentLike: mocks.deleteCommentLike,
  deleteNestedComment: mocks.deleteNestedComment,
  getCommentSocialSummary: mocks.getCommentSocialSummary,
  updateNestedComment: mocks.updateNestedComment
}))

function commentRow(overrides = {}) {
  return {
    id: 'join-1',
    comment_id: 'comment-1',
    comment: {
      id: 'comment-1',
      text: 'Original comment',
      created_by_id: 'user-1',
      created_at: '2026-01-01T00:00:00Z'
    },
    ...overrides
  }
}

function mountSection(overrides = {}) {
  return mount(CommentSection, {
    props: {
      parentPath: '/media/media-1',
      items: [commentRow(overrides)]
    },
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>'
        }
      }
    }
  })
}

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.isLoggedIn = true
    mocks.auth.isStaff = false
    mocks.auth.isAdmin = false
    mocks.auth.user = { id: 'user-1' }
    mocks.getCommentSocialSummary.mockResolvedValue({
      likes_count: 1,
      liked: false,
      like_id: null
    })
  })

  it('renders comments with social summary counts', async () => {
    const wrapper = mountSection()
    await flushPromises()

    expect(wrapper.text()).toContain('Original comment')
    expect(wrapper.text()).toContain('1 curtidas')
    expect(mocks.getCommentSocialSummary).toHaveBeenCalledWith('comment-1')
  })

  it('allows authenticated users to reply to a comment', async () => {
    mocks.createNestedComment.mockResolvedValue({})
    const wrapper = mountSection()
    await flushPromises()

    await wrapper.get('button:nth-of-type(2)').trigger('click')
    await wrapper.get('form textarea').setValue('Reply text')
    await wrapper.get('form').trigger('submit')

    expect(mocks.createNestedComment).toHaveBeenCalledWith(
      '/media/media-1',
      'Reply text',
      'comment-1'
    )
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })

  it('allows comment owners to edit and delete comments', async () => {
    mocks.updateNestedComment.mockResolvedValue({})
    mocks.deleteNestedComment.mockResolvedValue({})
    const wrapper = mountSection()
    await flushPromises()

    await wrapper.get('button:nth-of-type(3)').trigger('click')
    await wrapper.get('form textarea').setValue('Updated comment')
    await wrapper.get('form').trigger('submit')

    expect(mocks.updateNestedComment).toHaveBeenCalledWith(
      '/media/media-1',
      'join-1',
      'Updated comment',
      null
    )

    await wrapper.get('button:nth-of-type(4)').trigger('click')
    expect(mocks.deleteNestedComment).toHaveBeenCalledWith('/media/media-1', 'join-1')
  })

  it('toggles comment likes based on current summary state', async () => {
    mocks.createCommentLike.mockResolvedValue({})
    const wrapper = mountSection()
    await flushPromises()

    await wrapper.get('button:first-of-type').trigger('click')

    expect(mocks.createCommentLike).toHaveBeenCalledWith('comment-1')
  })

  it('shows a login link instead of mutation controls for anonymous users', async () => {
    mocks.auth.isLoggedIn = false
    mocks.auth.user = null
    const wrapper = mountSection({ comment: { ...commentRow().comment, created_by_id: 'user-2' } })
    await flushPromises()

    expect(wrapper.text()).toContain('Entre para interagir')
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
