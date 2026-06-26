import { describe, expect, it } from 'vitest'

import { labelForEntityType, routeForEntityRow } from '@/services/api/entity-routing'
import { allResources } from '@/services/api/resources'

describe('entity routing', () => {
  it('routes top-level entity types through the resource registry', () => {
    expect(routeForEntityRow({ entity_type: 'company', id: 'company-1' })).toEqual({
      label: 'Empresa',
      target: {
        name: 'company-detail',
        params: { id: 'company-1' }
      }
    })
  })

  it('routes media to the dedicated media detail page', () => {
    expect(routeForEntityRow({ entity_type: 'media', id: 'media-1' })).toEqual({
      label: 'Midia',
      target: {
        name: 'media-detail',
        params: { id: 'media-1' }
      }
    })
  })

  it('routes nested information rows to the nearest supported parent', () => {
    expect(
      routeForEntityRow({
        entity_type: 'location_information',
        id: 'info-1',
        location_id: 'location-1'
      })
    ).toEqual({
      label: 'Informacao do local',
      target: {
        name: 'resource-detail',
        params: { resource: 'locations', id: 'location-1' }
      }
    })
  })

  it('routes route sections to the dedicated route section detail page', () => {
    expect(
      routeForEntityRow({
        entity_type: 'route_section',
        id: 'section-1',
        railroad_route_id: 'route-1'
      })
    ).toEqual({
      label: 'Secao da rota',
      target: {
        name: 'route-section-detail',
        params: { routeId: 'route-1', sectionId: 'section-1' }
      }
    })
  })

  it('routes route section information to the route section when section ids are present', () => {
    expect(
      routeForEntityRow({
        entity_type: 'route_section_information',
        id: 'info-1',
        railroad_route_id: 'route-1',
        railroad_route_section_id: 'section-1'
      })
    ).toEqual({
      label: 'Informacao da secao da rota',
      target: {
        name: 'route-section-detail',
        params: { routeId: 'route-1', sectionId: 'section-1' }
      }
    })
  })

  it('routes sigo series information to the parent information detail without dead-end reason', () => {
    expect(
      routeForEntityRow({
        entity_type: 'sigo_series_information',
        id: 'series-1',
        information_id: 'info-1'
      })
    ).toEqual({
      label: 'Informacao da serie SIGO',
      target: {
        name: 'resource-detail',
        params: { resource: 'information', id: 'info-1' }
      }
    })
  })

  it('routes company paint scheme information to the owning company detail', () => {
    expect(
      routeForEntityRow({
        entity_type: 'company_paint_scheme_information',
        id: 'psi-1',
        company_id: 'company-1',
        paint_scheme_id: 'paint-1'
      })
    ).toEqual({
      label: 'Informacao da pintura',
      reason:
        'Informações de pintura são tratadas dentro da empresa; direcionado para a empresa vinculada.',
      target: {
        name: 'company-detail',
        params: { id: 'company-1' }
      }
    })
  })

  it('explains unsupported entity types without generating a bad link', () => {
    expect(routeForEntityRow({ entity_type: 'unknown_table', id: 'row-1' })).toEqual({
      label: 'unknown table',
      reason: 'No frontend detail route is available for unknown table.',
      target: null
    })
  })

  it('provides readable labels for known and unknown entity types', () => {
    expect(labelForEntityType('route_section_information')).toBe('Informacao da secao da rota')
    expect(labelForEntityType('custom_entity')).toBe('custom entity')
  })

  it('handles every backend search entity type with a route or explicit fallback reason', () => {
    const rows = [
      { entity_type: 'location', id: '1' },
      { entity_type: 'company', id: '1' },
      { entity_type: 'information', id: '1' },
      { entity_type: 'path', id: '1' },
      { entity_type: 'album', id: '1' },
      { entity_type: 'comment', id: '1' },
      { entity_type: 'route', id: '1' },
      { entity_type: 'manufacturer', id: '1' },
      { entity_type: 'location_information', id: '1', location_id: '1' },
      { entity_type: 'rolling_stock', id: '1' },
      { entity_type: 'media', id: '1' },
      { entity_type: 'company_paint_scheme', id: '1' },
      { entity_type: 'route_section', id: '1', railroad_route_id: '1' },
      { entity_type: 'locomotive_design', id: '1' },
      { entity_type: 'freight_car_type', id: '1' },
      { entity_type: 'non_revenue_car_type', id: '1' },
      { entity_type: 'location_state', id: '1' },
      { entity_type: 'location_city', id: '1', state_id: '1' },
      { entity_type: 'track_gauge', id: '1' },
      { entity_type: 'sigo_regional', id: '1' },
      { entity_type: 'freight_car_category', id: '1' },
      { entity_type: 'passenger_car_type', id: '1' },
      { entity_type: 'passenger_car_material', id: '1' },
      { entity_type: 'company_information', id: '1', company_id: '1' },
      { entity_type: 'manufacturer_information', id: '1', manufacturer_id: '1' },
      { entity_type: 'company_paint_scheme_information', id: '1', paint_scheme_id: '1' },
      { entity_type: 'route_information', id: '1', railroad_route_id: '1' },
      {
        entity_type: 'route_section_information',
        id: '1',
        railroad_route_id: '1',
        railroad_route_section_id: '1'
      },
      { entity_type: 'sigo_series_information', id: '1', information_id: '1' },
      { entity_type: 'freight_car_gross_weight_type', id: '1' },
      { entity_type: 'non_revenue_car', id: '1' }
    ]

    for (const row of rows) {
      const resolution = routeForEntityRow(row)
      if (row.entity_type === 'company_paint_scheme_information') {
        expect(resolution).toEqual({
          label: 'Informacao da pintura',
          reason:
            'Informações de pintura são tratadas dentro da empresa; direcionado para a pintura vinculada.',
          target: {
            name: 'resource-detail',
            params: { resource: 'paint-schemes', id: '1' }
          }
        })
        continue
      }

      expect(resolution.target ?? resolution.reason).toBeTruthy()
    }
  })

  it('keeps registry entity types aligned with known frontend route targets', () => {
    const resourcesWithEntityType = allResources.filter((resource) => Boolean(resource.entityType))
    const dedicatedRoutes: Record<
      string,
      | 'media-detail'
      | 'album-detail'
      | 'company-detail'
      | 'location-detail'
      | 'route-detail'
      | 'rolling-stock-detail'
    > = {
      media: 'media-detail',
      album: 'album-detail',
      company: 'company-detail',
      location: 'location-detail',
      route: 'route-detail',
      rolling_stock: 'rolling-stock-detail'
    }

    for (const resource of resourcesWithEntityType) {
      const resolution = routeForEntityRow({
        entity_type: resource.entityType as string,
        id: 'row-1'
      })

      expect(resolution.target).toBeTruthy()

      if (resource.entityType && dedicatedRoutes[resource.entityType]) {
        expect(resolution.target).toEqual({
          name: dedicatedRoutes[resource.entityType],
          params: { id: 'row-1' }
        })
        continue
      }

      expect(resolution.target).toEqual({
        name: 'resource-detail',
        params: { resource: resource.key, id: 'row-1' }
      })
    }
  })
})
