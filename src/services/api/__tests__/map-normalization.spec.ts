import { describe, expect, it } from 'vitest'

import { getMapCoordinates, normalizeMapItem } from '@/services/api/map-normalization'

describe('map normalization', () => {
  it('uses direct latitude and longitude when available', () => {
    expect(getMapCoordinates({ latitude: '-23.5', longitude: '-46.6' })).toEqual({
      lat: -23.5,
      lng: -46.6
    })
  })

  it('uses backend map coordinates for joined rows', () => {
    expect(getMapCoordinates({ map_latitude: -22.9, map_longitude: -47.1 })).toEqual({
      lat: -22.9,
      lng: -47.1
    })
  })

  it('normalizes map items without losing the original row', () => {
    expect(
      normalizeMapItem({
        entity_type: 'media',
        id: 'media-1',
        title: 'Photo',
        map_latitude: -22.9,
        map_longitude: -47.1
      })
    ).toEqual({
      entity_type: 'media',
      id: 'media-1',
      title: 'Photo',
      map_latitude: -22.9,
      map_longitude: -47.1,
      coordinates: {
        lat: -22.9,
        lng: -47.1
      }
    })
  })

  it('returns null coordinates when a row is incomplete', () => {
    expect(getMapCoordinates({ latitude: -23 })).toBeNull()
  })
})
