export type ResourceAccess = 'public' | 'auth' | 'staff' | 'admin'

export type ResourceConfig = {
  key: string
  label: string
  path: string
  entityType?: string
  access: ResourceAccess
  primaryFields: string[]
  detailFields?: string[]
}

export const publicResources: ResourceConfig[] = [
  {
    key: 'media',
    label: 'Mídia',
    path: '/media',
    entityType: 'media',
    access: 'public',
    primaryFields: ['title', 'description', 'status']
  },
  {
    key: 'albums',
    label: 'Álbuns',
    path: '/albums',
    entityType: 'album',
    access: 'public',
    primaryFields: ['title', 'description', 'status']
  },
  {
    key: 'comments',
    label: 'Comentários',
    path: '/comments',
    entityType: 'comment',
    access: 'public',
    primaryFields: ['text', 'status', 'created_at']
  },
  {
    key: 'information',
    label: 'Informações',
    path: '/information',
    entityType: 'information',
    access: 'public',
    primaryFields: ['title', 'description', 'status']
  }
]

export const domainResources: ResourceConfig[] = [
  {
    key: 'companies',
    label: 'Empresas',
    path: '/companies',
    entityType: 'company',
    access: 'public',
    primaryFields: ['name', 'code', 'status']
  },
  {
    key: 'manufacturers',
    label: 'Fabricantes',
    path: '/manufacturers',
    entityType: 'manufacturer',
    access: 'public',
    primaryFields: ['name', 'code', 'status']
  },
  {
    key: 'locations',
    label: 'Locais',
    path: '/locations',
    entityType: 'location',
    access: 'public',
    primaryFields: ['name', 'code', 'status']
  },
  {
    key: 'paths',
    label: 'Linhas',
    path: '/paths',
    entityType: 'path',
    access: 'public',
    primaryFields: ['name', 'code', 'status']
  },
  {
    key: 'routes',
    label: 'Rotas',
    path: '/routes',
    entityType: 'route',
    access: 'public',
    primaryFields: ['name', 'code', 'status']
  },
  {
    key: 'rolling-stock',
    label: 'Material rodante',
    path: '/rolling-stock',
    entityType: 'rolling_stock',
    access: 'public',
    primaryFields: ['number', 'prefix', 'status']
  },
  {
    key: 'locomotives',
    label: 'Locomotivas',
    path: '/locomotives',
    entityType: 'locomotive',
    access: 'public',
    primaryFields: ['number', 'prefix', 'status']
  },
  {
    key: 'freight-cars',
    label: 'Vagões de carga',
    path: '/freight-cars',
    entityType: 'freight_car',
    access: 'public',
    primaryFields: ['number', 'prefix', 'status']
  },
  {
    key: 'passenger-cars',
    label: 'Carros de passageiros',
    path: '/passenger-cars',
    entityType: 'passenger_car',
    access: 'public',
    primaryFields: ['number', 'prefix', 'status']
  },
  {
    key: 'non-revenue-cars',
    label: 'Veículos de serviço',
    path: '/non-revenue-cars',
    entityType: 'non_revenue_car',
    access: 'public',
    primaryFields: ['number', 'prefix', 'status']
  },
  {
    key: 'states',
    label: 'Estados',
    path: '/states',
    entityType: 'location_state',
    access: 'public',
    primaryFields: ['name', 'abbreviation']
  },
  {
    key: 'track-gauges',
    label: 'Bitolas',
    path: '/track-gauges',
    entityType: 'track_gauge',
    access: 'public',
    primaryFields: ['code', 'name']
  },
  {
    key: 'paint-schemes',
    label: 'Pinturas',
    path: '/paint-schemes',
    entityType: 'company_paint_scheme',
    access: 'public',
    primaryFields: ['name', 'status']
  },
  {
    key: 'sigo-regionals',
    label: 'Regionais SIGO',
    path: '/sigo-regionals',
    entityType: 'sigo_regional',
    access: 'public',
    primaryFields: ['letter', 'name']
  }
]

export const adminResources: ResourceConfig[] = [
  {
    key: 'users',
    label: 'Usuários',
    path: '/users',
    access: 'admin',
    primaryFields: ['email', 'username', 'is_staff', 'is_admin']
  },
  {
    key: 'mail',
    label: 'Fila de e-mail',
    path: '/mail',
    access: 'staff',
    primaryFields: ['subject', 'status', 'created_at']
  },
  {
    key: 'freight-car-categories',
    label: 'Categorias de vagões',
    path: '/freight-car-categories',
    access: 'staff',
    primaryFields: ['letter', 'name']
  },
  {
    key: 'freight-car-types',
    label: 'Tipos de vagões',
    path: '/freight-car-types',
    access: 'staff',
    primaryFields: ['letters', 'name']
  },
  {
    key: 'freight-car-gross-weight-types',
    label: 'Peso bruto de vagões',
    path: '/freight-car-gross-weight-types',
    access: 'staff',
    primaryFields: ['letter', 'name']
  },
  {
    key: 'locomotive-designs',
    label: 'Modelos de locomotivas',
    path: '/locomotive-designs',
    access: 'staff',
    primaryFields: ['name', 'manufacturer_id']
  },
  {
    key: 'passenger-car-types',
    label: 'Tipos de carros',
    path: '/passenger-car-types',
    access: 'staff',
    primaryFields: ['name']
  },
  {
    key: 'passenger-car-materials',
    label: 'Materiais de carros',
    path: '/passenger-car-materials',
    access: 'staff',
    primaryFields: ['name']
  },
  {
    key: 'non-revenue-car-types',
    label: 'Tipos de veículos de serviço',
    path: '/non-revenue-car-types',
    access: 'staff',
    primaryFields: ['name']
  }
]

export const allResources = [...publicResources, ...domainResources, ...adminResources]

export function findResource(key: string) {
  return allResources.find((resource) => resource.key === key)
}

export function resourceForEntityType(entityType: string) {
  return allResources.find((resource) => resource.entityType === entityType)
}
