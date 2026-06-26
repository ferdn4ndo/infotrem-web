import { apiClient } from '@/services/http/api-client'
import { getResource, listResource } from '@/services/api/resources.api'
import type { ListParams } from '@/types/api/pagination.type'
import type { EntityRow } from '@/types/domain/common.type'
import type { AlbumRow } from '@/types/domain/album.type'

export type AlbumDetail = {
  album?: AlbumRow
  social_summary?: EntityRow
  media?: EntityRow[]
  comments?: EntityRow[]
}

export function listAlbums(params: ListParams = {}) {
  return listResource<AlbumRow>('/albums', params)
}

export function getAlbum(albumId: string) {
  return getResource<AlbumRow>('/albums', albumId)
}

export function getAlbumDetail(albumId: string) {
  return apiClient.get<AlbumDetail>(`/albums/${albumId}/detail`)
}

export function listAlbumMedia(albumId: string, params: ListParams = {}) {
  return apiClient.get<{ items: EntityRow[]; count: number }>(`/albums/${albumId}/media`, {
    query: params
  })
}
