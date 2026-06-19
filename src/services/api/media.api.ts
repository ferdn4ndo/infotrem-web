import { apiClient } from '@/services/http/api-client'
import { createResource, listResource, getResource } from './resources.api'
import type { ListParams } from '@/types/api/pagination.type'
import type { EntityRow } from '@/types/domain/common.type'
import type { MediaCreatePayload, MediaRow } from '@/types/domain/media.type'

export const MEDIA_FALLBACK_LOGO_URL = '/logo-light-bg.svg'

export function listMedia(params: ListParams = {}) {
  return listResource<MediaRow>('/media', params)
}

export function getMedia(mediaId: string) {
  return getResource<MediaRow>('/media', mediaId)
}

export function createMedia(payload: MediaCreatePayload) {
  return createResource<MediaRow>('/media', payload)
}

export function listMediaRelation<T extends EntityRow = EntityRow>(
  mediaId: string,
  relation: string
) {
  return apiClient.get<{ items: T[]; count: number }>(`/media/${mediaId}/${relation}`)
}

export function uploadMediaFile(mediaId: string, file: File) {
  const formData = new FormData()
  formData.set('file', file)

  return apiClient.post<EntityRow>(`/media/${mediaId}/upload-from-file`, formData)
}

export function uploadMediaFromUrl(mediaId: string, payload: EntityRow) {
  return apiClient.post<EntityRow>(`/media/${mediaId}/upload-from-url`, payload)
}

export function createMediaDownload(mediaId: string, storageId: string, fileId: string) {
  return apiClient.post<EntityRow>(
    `/media/${mediaId}/storages/${storageId}/files/${fileId}/download`
  )
}

export function mediaRawUrl(
  mediaId: string,
  storageId: string,
  fileId: string,
  downloadId: string
) {
  return `/api/media/${mediaId}/storages/${storageId}/files/${fileId}/raw/${downloadId}`
}

function toStringOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function mediaRawThumbnailCandidate(media: EntityRow) {
  const mediaId = toStringOrNull(media.id)
  const storageId = toStringOrNull(media.filemgr_storage_id)
  const thumbnailFileId = toStringOrNull(media.thumbnail_filemgr_uuid)
  const thumbnailDownloadId =
    toStringOrNull(media.thumbnail_download_id) ??
    toStringOrNull(media.thumbnail_filemgr_download_id)

  if (!mediaId || !storageId || !thumbnailFileId) {
    return null
  }

  // Prefer explicit download id when available; otherwise keep defensive same-id fallback.
  return mediaRawUrl(mediaId, storageId, thumbnailFileId, thumbnailDownloadId ?? thumbnailFileId)
}

export function mediaThumbnailUrl(media: EntityRow) {
  return (
    toStringOrNull(media.thumbnail_url) ??
    toStringOrNull(media.preview_url) ??
    mediaRawThumbnailCandidate(media) ??
    toStringOrNull(media.media_url) ??
    toStringOrNull(media.original_url) ??
    MEDIA_FALLBACK_LOGO_URL
  )
}

export function mediaPreviewUrl(media: EntityRow) {
  return mediaThumbnailUrl(media)
}

export function isVideoMedia(media: EntityRow) {
  const typeCandidate =
    `${toStringOrNull(media.type) ?? ''} ${toStringOrNull(media.mime_type) ?? ''}`.toLowerCase()
  const source = toStringOrNull(media.original_url) ?? toStringOrNull(media.media_url) ?? ''

  if (typeCandidate.includes('video')) {
    return true
  }

  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(source)
}

export function toFallbackImage(event: Event) {
  const target = event.target as HTMLImageElement | null
  if (!target || target.src.endsWith(MEDIA_FALLBACK_LOGO_URL)) {
    return
  }

  console.warn('[media.api] Primary media thumbnail URL failed; switching to fallback logo.', {
    src: target.src
  })
  target.src = MEDIA_FALLBACK_LOGO_URL
}
