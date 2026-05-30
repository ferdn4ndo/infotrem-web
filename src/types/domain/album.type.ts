import type { EntityRow } from './common.type'

export type AlbumRow = EntityRow & {
  id: string
  title?: string
  description?: string
  status?: string
}
