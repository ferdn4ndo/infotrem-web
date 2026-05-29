import type { EntityRow } from './common.type'

export type MediaRow = EntityRow & {
  id: string
  title?: string
  description?: string
  status?: string
  author?: string
  source?: string
  media_date?: string | null
  thumbnail_filemgr_uuid?: string | null
  filemgr_storage_id?: string | null
  filemgr_file_id?: string | null
}
