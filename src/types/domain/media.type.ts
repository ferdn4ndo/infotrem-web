import type { EntityRow } from './common.type'

export type MediaRow = EntityRow & {
  id: string
  title?: string
  type?: string
  description?: string
  status?: string
  known_author?: boolean
  author_confirmed?: boolean
  author_id?: string | null
  original_url?: string
  references?: string
  thumbnail_filemgr_uuid?: string | null
  filemgr_storage_id?: string | null
  filemgr_file_id?: string | null
}

export type MediaCreatePayload = {
  title: string
  type?: string
  description?: string
  status?: string
  known_author?: boolean
  author_confirmed?: boolean
  author_id?: string
  original_url?: string
  references?: string
  location_id?: string
}
