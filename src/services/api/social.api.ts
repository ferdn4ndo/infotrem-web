import { apiClient } from '@/services/http/api-client'
import type { ListParams } from '@/types/api/pagination.type'
import type { EntityRow } from '@/types/domain/common.type'

export type NestedCommentPayload = {
  comment: {
    text: string
    replies_to_id?: string | null
  }
}

export type SocialSummary = {
  likes_count: number
  liked?: boolean
  like_id?: string | null
  favorites_count?: number
  favorited?: boolean
  favorite_id?: string | null
}

type RequestSignalOptions = {
  signal?: AbortSignal
}

export function listNested(
  parentPath: string,
  relation: string,
  params: ListParams = {},
  options: RequestSignalOptions = {}
) {
  return apiClient.get<{ items: EntityRow[]; count: number }>(`${parentPath}/${relation}`, {
    query: params,
    signal: options.signal
  })
}

export function createNested(parentPath: string, relation: string, payload: EntityRow = {}) {
  return apiClient.post<EntityRow>(`${parentPath}/${relation}`, payload)
}

export function buildNestedCommentPayload(
  text: string,
  repliesToId: string | null = null
): NestedCommentPayload {
  return {
    comment: {
      text,
      replies_to_id: repliesToId
    }
  }
}

export function createNestedComment(
  parentPath: string,
  text: string,
  repliesToId: string | null = null
) {
  return apiClient.post<EntityRow>(
    `${parentPath}/comments`,
    buildNestedCommentPayload(text, repliesToId)
  )
}

export function updateNestedComment(
  parentPath: string,
  relationId: string,
  text: string,
  repliesToId: string | null = null
) {
  return updateNested(
    parentPath,
    'comments',
    relationId,
    buildNestedCommentPayload(text, repliesToId)
  )
}

export function deleteNestedComment(parentPath: string, relationId: string) {
  return deleteNested(parentPath, 'comments', relationId)
}

export function createCommentLike(commentId: string) {
  return createNested(`/comments/${commentId}`, 'likes')
}

export function deleteCommentLike(commentId: string, likeId: string) {
  return deleteNested(`/comments/${commentId}`, 'likes', likeId)
}

export function updateNested(parentPath: string, relation: string, id: string, payload: EntityRow) {
  return apiClient.patch<EntityRow>(`${parentPath}/${relation}/${id}`, payload)
}

export function deleteNested(parentPath: string, relation: string, id: string) {
  return apiClient.delete(`${parentPath}/${relation}/${id}`)
}

export function deleteSocialRelation(
  parentPath: string,
  relation: 'favorites' | 'likes',
  id: string
) {
  return deleteNested(parentPath, relation, id)
}

export function getSocialSummary(parentPath: string) {
  return apiClient.get<SocialSummary>(`${parentPath}/social-summary`)
}

export function getCommentSocialSummary(commentId: string) {
  return getSocialSummary(`/comments/${commentId}`)
}
