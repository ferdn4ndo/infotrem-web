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

  it('renders threaded replies and collapses depth above three levels', async () => {
    const wrapper = mount(CommentSection, {
      props: {
        parentPath: '/media/media-1',
        items: [
          commentRow(),
          commentRow({
            id: 'join-2',
            comment_id: 'comment-2',
            comment: {
              id: 'comment-2',
              text: 'Reply level 1',
              created_by_id: 'user-2',
              created_at: '2026-01-01T00:01:00Z',
              replies_to_id: 'comment-1'
            }
          }),
          commentRow({
            id: 'join-3',
            comment_id: 'comment-3',
            comment: {
              id: 'comment-3',
              text: 'Reply level 2',
              created_by_id: 'user-3',
              created_at: '2026-01-01T00:02:00Z',
              replies_to_id: 'comment-2'
            }
          }),
          commentRow({
            id: 'join-4',
            comment_id: 'comment-4',
            comment: {
              id: 'comment-4',
              text: 'Reply level 3',
              created_by_id: 'user-4',
              created_at: '2026-01-01T00:03:00Z',
              replies_to_id: 'comment-3'
            }
          }),
          commentRow({
            id: 'join-5',
            comment_id: 'comment-5',
            comment: {
              id: 'comment-5',
              text: 'Reply level 4',
              created_by_id: 'user-5',
              created_at: '2026-01-01T00:04:00Z',
              replies_to_id: 'comment-4'
            }
          })
        ]
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
    await flushPromises()

    expect(wrapper.text()).toContain('Reply level 1')
    expect(wrapper.text()).toContain('Reply level 2')
    expect(wrapper.text()).toContain('resposta(s) adicional(is) ocultas')
    expect(wrapper.text()).not.toContain('Reply level 3')
    expect(wrapper.text()).not.toContain('Reply level 4')
  })

  it('allows authenticated users to reply to a comment', async () => {
    mocks.createNestedComment.mockResolvedValue({})
    const wrapper = mountSection()
    await flushPromises()

    await wrapper.get('[data-cy="comment-reply"]').trigger('click')
    await wrapper.get('[data-cy="comment-reply-text"]').setValue('Reply text')
    const replyForm = wrapper
      .findAll('form')
      .find((form) => form.find('[data-cy="comment-reply-text"]').exists())
    if (!replyForm) {
      throw new Error('Reply form not found')
    }
    await replyForm.trigger('submit')

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

    await wrapper.get('[data-cy="comment-edit"]').trigger('click')
    await wrapper.get('[data-cy="comment-edit-text"]').setValue('Updated comment')
    const editForm = wrapper
      .findAll('form')
      .find((form) => form.find('[data-cy="comment-edit-text"]').exists())
    if (!editForm) {
      throw new Error('Edit form not found')
    }
    await editForm.trigger('submit')

    expect(mocks.updateNestedComment).toHaveBeenCalledWith(
      '/media/media-1',
      'join-1',
      'Updated comment',
      null
    )

    await wrapper.get('[data-cy="comment-delete"]').trigger('click')
    expect(mocks.deleteNestedComment).toHaveBeenCalledWith('/media/media-1', 'join-1')
  })

  it('toggles comment likes based on current summary state', async () => {
    mocks.createCommentLike.mockResolvedValue({})
    const wrapper = mountSection()
    await flushPromises()

    await wrapper.get('[data-cy="comment-like"]').trigger('click')

    expect(mocks.createCommentLike).toHaveBeenCalledWith('comment-1')
  })

  it('loads social summaries only for newly added comment ids', async () => {
    const wrapper = mount(CommentSection, {
      props: {
        parentPath: '/media/media-1',
        items: [commentRow(), commentRow({ id: 'join-2', comment_id: 'comment-2' })]
      },
      global: {
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' }
        }
      }
    })
    await flushPromises()
    expect(mocks.getCommentSocialSummary).toHaveBeenCalledTimes(2)

    await wrapper.setProps({
      items: [
        commentRow(),
        commentRow({ id: 'join-2', comment_id: 'comment-2' }),
        commentRow({
          id: 'join-3',
          comment_id: 'comment-3',
          comment: {
            id: 'comment-3',
            text: 'Third comment',
            created_by_id: 'user-3',
            created_at: '2026-01-01T00:03:00Z'
          }
        })
      ]
    })
    await flushPromises()

    expect(mocks.getCommentSocialSummary).toHaveBeenCalledTimes(3)
    expect(mocks.getCommentSocialSummary).toHaveBeenLastCalledWith('comment-3')
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
