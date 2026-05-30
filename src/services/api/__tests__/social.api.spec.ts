import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '@/services/http/api-client'
import {
  buildNestedCommentPayload,
  createCommentLike,
  deleteCommentLike,
  deleteNestedComment,
  getCommentSocialSummary,
  updateNestedComment
} from '@/services/api/social.api'

vi.mock('@/services/http/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    get: vi.fn()
  }
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildNestedCommentPayload', () => {
  it('wraps nested comment text in the backend contract shape', () => {
    expect(buildNestedCommentPayload('Great photo')).toEqual({
      comment: {
        text: 'Great photo',
        replies_to_id: null
      }
    })
  })

  it('includes a reply target when provided', () => {
    expect(buildNestedCommentPayload('Replying', 'comment-1')).toEqual({
      comment: {
        text: 'Replying',
        replies_to_id: 'comment-1'
      }
    })
  })
})

describe('comment social API helpers', () => {
  it('updates nested comments using the wrapped backend payload', () => {
    updateNestedComment('/media/media-1', 'join-1', 'Updated', 'comment-1')

    expect(apiClient.patch).toHaveBeenCalledWith('/media/media-1/comments/join-1', {
      comment: {
        text: 'Updated',
        replies_to_id: 'comment-1'
      }
    })
  })

  it('deletes nested comments by relation id', () => {
    deleteNestedComment('/albums/album-1', 'join-1')

    expect(apiClient.delete).toHaveBeenCalledWith('/albums/album-1/comments/join-1')
  })

  it('creates and removes comment likes through the comment resource', () => {
    createCommentLike('comment-1')
    deleteCommentLike('comment-1', 'like-1')

    expect(apiClient.post).toHaveBeenCalledWith('/comments/comment-1/likes', {})
    expect(apiClient.delete).toHaveBeenCalledWith('/comments/comment-1/likes/like-1')
  })

  it('loads comment social summaries through the comment resource', () => {
    getCommentSocialSummary('comment-1')

    expect(apiClient.get).toHaveBeenCalledWith('/comments/comment-1/social-summary')
  })
})
