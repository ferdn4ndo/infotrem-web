import type { EntityRow } from '@/types/domain/common.type'

export type MapCoordinates = {
  lat: number
  lng: number
}

export type NormalizedMapItem = EntityRow & {
  entity_type: string
  coordinates: MapCoordinates | null
}

const latitudeFields = ['latitude', 'center_latitude', 'map_latitude']
const longitudeFields = ['longitude', 'lng', 'lon', 'center_longitude', 'map_longitude']

function numberFromField(row: EntityRow, fields: string[]) {
  for (const field of fields) {
    const value = row[field]
    const numeric = typeof value === 'number' ? value : Number(value)

    if (Number.isFinite(numeric)) {
      return numeric
    }
  }

  return null
}

export function getMapCoordinates(row: EntityRow): MapCoordinates | null {
  const lat = numberFromField(row, latitudeFields)
  const lng = numberFromField(row, longitudeFields)

  if (lat === null || lng === null) {
    return null
  }

  return { lat, lng }
}

export function normalizeMapItem(row: EntityRow & { entity_type: string }): NormalizedMapItem {
  return {
    ...row,
    coordinates: getMapCoordinates(row)
  }
}

export function normalizeMapItems(rows: Array<EntityRow & { entity_type: string }>) {
  return rows.map(normalizeMapItem)
}
