import { resourceForEntityType } from '@/services/api/resources'
import type { EntityRow } from '@/types/domain/common.type'

export type EntityRouteTarget = {
  name: 'album-detail' | 'media-detail' | 'resource-detail' | 'route-section-detail'
  params: Record<string, string>
}

export type EntityRouteResolution = {
  target: EntityRouteTarget | null
  label: string
  reason?: string
}

type ParentRouteConfig = {
  resource: string
  idField: string
  reason?: string
}

const entityLabels: Record<string, string> = {
  album: 'Album',
  comment: 'Comment',
  company: 'Company',
  company_information: 'Company information',
  company_paint_scheme: 'Paint scheme',
  company_paint_scheme_information: 'Paint scheme information',
  freight_car: 'Freight car',
  freight_car_category: 'Freight car category',
  freight_car_gross_weight_type: 'Freight car gross weight type',
  freight_car_type: 'Freight car type',
  information: 'Information',
  location: 'Location',
  location_city: 'City',
  location_information: 'Location information',
  location_state: 'State',
  locomotive: 'Locomotive',
  locomotive_design: 'Locomotive design',
  manufacturer: 'Manufacturer',
  manufacturer_information: 'Manufacturer information',
  media: 'Media',
  non_revenue_car: 'Non-revenue car',
  non_revenue_car_type: 'Non-revenue car type',
  passenger_car: 'Passenger car',
  passenger_car_material: 'Passenger car material',
  passenger_car_type: 'Passenger car type',
  path: 'Path',
  rolling_stock: 'Rolling stock',
  route: 'Route',
  route_information: 'Route information',
  route_section: 'Route section',
  route_section_information: 'Route section information',
  sigo_regional: 'SIGO regional',
  sigo_series_information: 'SIGO series information',
  track_gauge: 'Track gauge'
}

const parentRoutes: Record<string, ParentRouteConfig> = {
  company_information: { resource: 'companies', idField: 'company_id' },
  company_paint_scheme_information: {
    resource: 'paint-schemes',
    idField: 'paint_scheme_id'
  },
  location_city: {
    resource: 'states',
    idField: 'state_id',
    reason: 'City detail pages are not available yet; linked to the parent state.'
  },
  location_information: { resource: 'locations', idField: 'location_id' },
  manufacturer_information: { resource: 'manufacturers', idField: 'manufacturer_id' },
  route_information: { resource: 'routes', idField: 'railroad_route_id' },
  route_section_information: {
    resource: 'routes',
    idField: 'railroad_route_id',
    reason:
      'Route section information detail pages are not available yet; linked to the parent route.'
  },
  sigo_series_information: {
    resource: 'information',
    idField: 'information_id',
    reason:
      'SIGO series information detail pages are not available yet; linked to the parent information record.'
  }
}

const directRoutes: Record<string, { name: EntityRouteTarget['name'] }> = {
  album: { name: 'album-detail' },
  media: { name: 'media-detail' }
}

function idToString(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

export function labelForEntityType(entityType: string) {
  return entityLabels[entityType] ?? entityType.replace(/_/g, ' ')
}

export function routeForEntityRow(row: EntityRow): EntityRouteResolution {
  const entityType = String(row.entity_type ?? '')
  const label = labelForEntityType(entityType)
  const directResource = resourceForEntityType(entityType)
  const directRoute = directRoutes[entityType]
  const directId = idToString(row.id)

  if (directRoute && directId) {
    return {
      label,
      target: {
        name: directRoute.name,
        params: { id: directId }
      }
    }
  }

  if (entityType === 'route_section' && directId) {
    const routeId = idToString(row.railroad_route_id)
    if (routeId) {
      return {
        label,
        target: {
          name: 'route-section-detail',
          params: { routeId, sectionId: directId }
        }
      }
    }
  }

  if (entityType === 'route_section_information') {
    const routeId = idToString(row.railroad_route_id)
    const sectionId =
      idToString(row.railroad_route_section_id) ??
      idToString(row.route_section_id) ??
      idToString(row.section_id)
    if (routeId && sectionId) {
      return {
        label,
        target: {
          name: 'route-section-detail',
          params: { routeId, sectionId }
        }
      }
    }
  }

  if (directResource && directId) {
    return {
      label,
      target: {
        name: 'resource-detail',
        params: { resource: directResource.key, id: directId }
      }
    }
  }

  const parent = parentRoutes[entityType]
  const parentId = parent ? idToString(row[parent.idField]) : null

  if (parent && parentId) {
    return {
      label,
      reason: parent.reason,
      target: {
        name: 'resource-detail',
        params: { resource: parent.resource, id: parentId }
      }
    }
  }

  return {
    label,
    reason: `No frontend detail route is available for ${label}.`,
    target: null
  }
}
