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
  comment: 'Comentario',
  company: 'Empresa',
  company_information: 'Informacao da empresa',
  company_paint_scheme: 'Pintura da empresa',
  company_paint_scheme_information: 'Informacao da pintura',
  freight_car: 'Vagao de carga',
  freight_car_category: 'Categoria de vagao de carga',
  freight_car_gross_weight_type: 'Tipo de peso bruto de vagao de carga',
  freight_car_type: 'Tipo de vagao de carga',
  information: 'Informacao',
  location: 'Local',
  location_city: 'Cidade',
  location_information: 'Informacao do local',
  location_state: 'Estado',
  locomotive: 'Locomotiva',
  locomotive_design: 'Projeto de locomotiva',
  manufacturer: 'Fabricante',
  manufacturer_information: 'Informacao do fabricante',
  media: 'Midia',
  non_revenue_car: 'Veiculo de servico',
  non_revenue_car_type: 'Tipo de veiculo de servico',
  passenger_car: 'Carro de passageiros',
  passenger_car_material: 'Material de carro de passageiros',
  passenger_car_type: 'Tipo de carro de passageiros',
  path: 'Linha',
  rolling_stock: 'Material rodante',
  route: 'Rota',
  route_information: 'Informacao da rota',
  route_section: 'Secao da rota',
  route_section_information: 'Informacao da secao da rota',
  sigo_regional: 'SIGO regional',
  sigo_series_information: 'Informacao da serie SIGO',
  track_gauge: 'Bitola'
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
