import { apiClient } from '@/services/http/api-client'
import type { EntityRow } from '@/types/domain/common.type'

export type MapQuery = {
  lat: number
  lng: number
  zoom?: number
  width?: number
  height?: number
}

export type MapResult = {
  items: Array<EntityRow & { entity_type: string }>
  bounds: EntityRow
}

export function getMapData(query: MapQuery) {
  return apiClient.get<MapResult>('/map', { query })
}
