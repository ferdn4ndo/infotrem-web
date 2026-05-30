import { getResource, listResource } from '@/services/api/resources.api'
import type { ListParams } from '@/types/api/pagination.type'
import type { AlbumRow } from '@/types/domain/album.type'

export function listAlbums(params: ListParams = {}) {
  return listResource<AlbumRow>('/albums', params)
}

export function getAlbum(albumId: string) {
  return getResource<AlbumRow>('/albums', albumId)
}
