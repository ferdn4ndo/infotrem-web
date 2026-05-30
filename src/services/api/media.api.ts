import { apiClient } from '@/services/http/api-client'
import { createResource, listResource, getResource } from './resources.api'
import type { ListParams } from '@/types/api/pagination.type'
import type { EntityRow } from '@/types/domain/common.type'
import type { MediaCreatePayload, MediaRow } from '@/types/domain/media.type'

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
