export type ResourceAccess = 'public' | 'auth' | 'staff' | 'admin'

export type RelationConfig = {
  key: string
  label: string
  pathSuffix: string
  parentParam: string
  access: ResourceAccess
  primaryFields: string[]
  writeFields?: string[]
  kind?: 'crud' | 'owned-toggle' | 'readonly'
}

export type ResourceConfig = {
  key: string
  label: string
  path: string
  entityType?: string
  access: ResourceAccess
  primaryFields: string[]
  detailFields?: string[]
  writeFields?: string[]
  relations?: RelationConfig[]
}

export const publicResources: ResourceConfig[] = [
  {
    key: 'media',
    label: 'Mídia',
    path: '/media',
    entityType: 'media',
    access: 'public',
    primaryFields: ['title', 'description', 'status'],
    writeFields: [
      'title',
      'type',
      'description',
      'status',
      'original_url',
      'references',
      'known_author',
      'author_confirmed',
      'author_id',
      'location_id'
    ],
    relations: [
      {
        key: 'images',
        label: 'Imagens',
        pathSuffix: 'images',
        parentParam: 'media_id',
        access: 'public',
        primaryFields: ['description', 'capture_date', 'id'],
        writeFields: ['description', 'capture_date', 'camera_model', 'is_primary']
      },
      {
        key: 'videos',
        label: 'Vídeos',
        pathSuffix: 'videos',
        parentParam: 'media_id',
        access: 'public',
        primaryFields: ['description', 'duration', 'id'],
        writeFields: ['description', 'duration', 'codec']
      },
      {
        key: 'documents',
        label: 'Documentos',
        pathSuffix: 'documents',
        parentParam: 'media_id',
        access: 'public',
        primaryFields: ['description', 'pages', 'id'],
        writeFields: ['description', 'pages', 'mime_type']
      },
      {
        key: 'rolling-stock',
        label: 'Material rodante',
        pathSuffix: 'rolling-stock',
        parentParam: 'media_id',
        access: 'staff',
        primaryFields: ['rolling_stock_id', 'media_id', 'id'],
        writeFields: ['rolling_stock_id']
      },
      {
        key: 'albums',
        label: 'Álbuns',
        pathSuffix: 'albums',
        parentParam: 'media_id',
        access: 'staff',
        primaryFields: ['album_id', 'media_id', 'id'],
        writeFields: ['album_id']
      },
      {
        key: 'reviews',
        label: 'Avaliações',
        pathSuffix: 'reviews',
        parentParam: 'media_id',
        access: 'auth',
        primaryFields: ['decision', 'status', 'id'],
        writeFields: ['decision', 'status', 'reason']
      },
      {
        key: 'likes',
        label: 'Curtir',
        pathSuffix: 'likes',
        parentParam: 'media_id',
        access: 'auth',
        primaryFields: ['liked_by_id', 'liked_at', 'id'],
        kind: 'owned-toggle'
      },
      {
        key: 'favorites',
        label: 'Favoritar',
        pathSuffix: 'favorites',
        parentParam: 'media_id',
        access: 'auth',
        primaryFields: ['favorited_by_id', 'favorited_at', 'id'],
        kind: 'owned-toggle'
      }
    ]
  },
  {
    key: 'albums',
    label: 'Álbuns',
    path: '/albums',
    entityType: 'album',
    access: 'public',
    primaryFields: ['title', 'description', 'status'],
    writeFields: ['title', 'description', 'status'],
    relations: [
      {
        key: 'media',
        label: 'Mídia',
        pathSuffix: 'media',
        parentParam: 'album_id',
        access: 'staff',
        primaryFields: ['media_id', 'album_id', 'id'],
        writeFields: ['media_id']
      },
      {
        key: 'likes',
        label: 'Curtir',
        pathSuffix: 'likes',
        parentParam: 'album_id',
        access: 'auth',
        primaryFields: ['liked_by_id', 'liked_at', 'id'],
        kind: 'owned-toggle'
      },
      {
        key: 'favorites',
        label: 'Favoritar',
        pathSuffix: 'favorites',
        parentParam: 'album_id',
        access: 'auth',
        primaryFields: ['favorited_by_id', 'favorited_at', 'id'],
        kind: 'owned-toggle'
      }
    ]
  },
  {
    key: 'comments',
    label: 'Comentários',
    path: '/comments',
    entityType: 'comment',
    access: 'public',
    primaryFields: ['text', 'status', 'created_at'],
    relations: [
      {
        key: 'likes',
        label: 'Curtir',
        pathSuffix: 'likes',
        parentParam: 'comment_id',
        access: 'auth',
        primaryFields: ['liked_by_id', 'liked_at', 'id'],
        kind: 'owned-toggle'
      }
    ]
  },
  {
    key: 'information',
    label: 'Informações',
    path: '/information',
    entityType: 'information',
    access: 'public',
    primaryFields: ['title', 'description', 'status'],
    writeFields: ['title', 'content', 'status', 'references'],
    relations: [
      {
        key: 'effects',
        label: 'Propostas de alteração',
        pathSuffix: 'effects',
        parentParam: 'information_id',
        access: 'auth',
        primaryFields: ['field_name', 'old_value', 'new_value', 'id'],
        writeFields: ['field_name', 'old_value', 'new_value']
      },
      {
        key: 'votes',
        label: 'Votos',
        pathSuffix: 'votes',
        parentParam: 'information_id',
        access: 'auth',
        primaryFields: ['value', 'created_by_id', 'id'],
        writeFields: ['value']
      },
      {
        key: 'sigo-series',
        label: 'Séries SIGO',
        pathSuffix: 'sigo-series',
        parentParam: 'information_id',
        access: 'staff',
        primaryFields: ['manufacturer_id', 'sigo_regional_id', 'sigo_number', 'id'],
        writeFields: ['manufacturer_id', 'sigo_regional_id', 'sigo_number', 'status']
      }
    ]
  }
]

export const domainResources: ResourceConfig[] = [
  {
    key: 'companies',
    label: 'Empresas',
    path: '/companies',
    entityType: 'company',
    access: 'public',
    primaryFields: ['name', 'abbrev', 'id'],
    writeFields: ['name', 'abbrev'],
    relations: [
      {
        key: 'information',
        label: 'Informações',
        pathSuffix: 'information',
        parentParam: 'company_id',
        access: 'public',
        primaryFields: ['title', 'content', 'status'],
        writeFields: ['information_id']
      },
      {
        key: 'paint-schemes',
        label: 'Pinturas',
        pathSuffix: 'paint-schemes',
        parentParam: 'company_id',
        access: 'staff',
        primaryFields: ['name', 'status', 'id'],
        writeFields: ['name', 'status']
      }
    ]
  },
  {
    key: 'manufacturers',
    label: 'Fabricantes',
    path: '/manufacturers',
    entityType: 'manufacturer',
    access: 'public',
    primaryFields: ['full_name', 'short_name', 'id'],
    writeFields: ['full_name', 'short_name'],
    relations: [
      {
        key: 'information',
        label: 'Informações',
        pathSuffix: 'information',
        parentParam: 'manufacturer_id',
        access: 'public',
        primaryFields: ['title', 'content', 'status'],
        writeFields: ['information_id']
      }
    ]
  },
  {
    key: 'locations',
    label: 'Locais',
    path: '/locations',
    entityType: 'location',
    access: 'public',
    primaryFields: ['name', 'code', 'status'],
    writeFields: ['name', 'code', 'status', 'center_latitude', 'center_longitude', 'is_verified'],
    relations: [
      {
        key: 'information',
        label: 'Informações',
        pathSuffix: 'information',
        parentParam: 'location_id',
        access: 'public',
        primaryFields: ['title', 'content', 'status'],
        writeFields: ['information_id']
      },
      {
        key: 'track-gauges',
        label: 'Bitolas',
        pathSuffix: 'track-gauges',
        parentParam: 'location_id',
        access: 'staff',
        primaryFields: ['gauge_id', 'location_id', 'id'],
        writeFields: ['gauge_id']
      },
      {
        key: 'paths',
        label: 'Linhas',
        pathSuffix: 'paths',
        parentParam: 'location_id',
        access: 'staff',
        primaryFields: ['path_id', 'location_id', 'id'],
        writeFields: ['path_id']
      }
    ]
  },
  {
    key: 'paths',
    label: 'Linhas',
    path: '/paths',
    entityType: 'path',
    access: 'public',
    primaryFields: ['name', 'type', 'status'],
    writeFields: ['name', 'type', 'status'],
    relations: [
      {
        key: 'locations',
        label: 'Locais',
        pathSuffix: 'locations',
        parentParam: 'path_id',
        access: 'staff',
        primaryFields: ['location_id', 'path_id', 'id'],
        writeFields: ['location_id']
      },
      {
        key: 'points',
        label: 'Pontos',
        pathSuffix: 'points',
        parentParam: 'path_id',
        access: 'staff',
        primaryFields: ['order', 'latitude', 'longitude', 'id'],
        writeFields: ['order', 'latitude', 'longitude', 'is_reference']
      }
    ]
  },
  {
    key: 'routes',
    label: 'Rotas',
    path: '/routes',
    entityType: 'route',
    access: 'public',
    primaryFields: ['name', 'builder_railroad_id', 'id'],
    writeFields: ['name', 'builder_railroad_id'],
    relations: [
      {
        key: 'sections',
        label: 'Seções',
        pathSuffix: 'sections',
        parentParam: 'route_id',
        access: 'staff',
        primaryFields: ['name', 'status', 'id'],
        writeFields: ['name', 'status']
      },
      {
        key: 'information',
        label: 'Informações',
        pathSuffix: 'information',
        parentParam: 'route_id',
        access: 'public',
        primaryFields: ['title', 'content', 'status', 'id'],
        writeFields: ['information_id']
      }
    ]
  },
  {
    key: 'rolling-stock',
    label: 'Material rodante',
    path: '/rolling-stock',
    entityType: 'rolling_stock',
    access: 'public',
    primaryFields: ['painted_identifier', 'serial_number', 'type'],
    writeFields: [
      'type',
      'gauge_id',
      'manufacturer_id',
      'is_sigo',
      'sigo_number',
      'painted_identifier',
      'serial_number',
      'build_year'
    ],
    relations: [
      {
        key: 'freight-car',
        label: 'Vagões de carga',
        pathSuffix: 'freight-car',
        parentParam: 'rolling_stock_id',
        access: 'staff',
        primaryFields: ['number', 'prefix', 'status', 'id'],
        writeFields: [
          'freight_car_type_id',
          'freight_car_category_id',
          'freight_car_gross_weight_type_id',
          'number',
          'prefix',
          'status'
        ]
      },
      {
        key: 'passenger-car',
        label: 'Carros de passageiros',
        pathSuffix: 'passenger-car',
        parentParam: 'rolling_stock_id',
        access: 'staff',
        primaryFields: ['number', 'prefix', 'status', 'id'],
        writeFields: [
          'passenger_car_type_id',
          'passenger_car_material_id',
          'number',
          'prefix',
          'status'
        ]
      },
      {
        key: 'non-revenue-car',
        label: 'Veículos de serviço',
        pathSuffix: 'non-revenue-car',
        parentParam: 'rolling_stock_id',
        access: 'staff',
        primaryFields: ['number', 'prefix', 'status', 'id'],
        writeFields: ['non_revenue_car_type_id', 'number', 'prefix', 'status']
      },
      {
        key: 'media',
        label: 'Mídia',
        pathSuffix: 'media',
        parentParam: 'rolling_stock_id',
        access: 'staff',
        primaryFields: ['media_id', 'rolling_stock_id', 'id'],
        writeFields: ['media_id']
      },
      {
        key: 'information',
        label: 'Informações',
        pathSuffix: 'information',
        parentParam: 'rolling_stock_id',
        access: 'public',
        primaryFields: ['title', 'content', 'status', 'id'],
        writeFields: ['information_id']
      }
    ]
  },
  {
    key: 'locomotives',
    label: 'Locomotivas',
    path: '/locomotives',
    entityType: 'locomotive',
    access: 'public',
    primaryFields: ['rolling_stock_id', 'design_id', 'id'],
    writeFields: ['rolling_stock_id', 'design_id']
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
    primaryFields: ['name', 'abbrev', 'ibge_id'],
    writeFields: ['name', 'abbrev', 'ibge_id'],
    relations: [
      {
        key: 'cities',
        label: 'Cidades',
        pathSuffix: 'cities',
        parentParam: 'state_id',
        access: 'admin',
        primaryFields: ['name', 'ibge_id', 'id'],
        writeFields: ['name', 'ibge_id']
      }
    ]
  },
  {
    key: 'track-gauges',
    label: 'Bitolas',
    path: '/track-gauges',
    entityType: 'track_gauge',
    access: 'public',
    primaryFields: ['code', 'size'],
    writeFields: ['code', 'size']
  },
  {
    key: 'paint-schemes',
    label: 'Pinturas',
    path: '/paint-schemes',
    entityType: 'company_paint_scheme',
    access: 'public',
    primaryFields: ['name', 'status'],
    writeFields: ['name', 'status'],
    relations: [
      {
        key: 'information',
        label: 'Informações',
        pathSuffix: 'information',
        parentParam: 'paint_scheme_id',
        access: 'public',
        primaryFields: ['title', 'content', 'status', 'id'],
        writeFields: ['information_id']
      }
    ]
  },
  {
    key: 'sigo-regionals',
    label: 'Regionais SIGO',
    path: '/sigo-regionals',
    entityType: 'sigo_regional',
    access: 'public',
    primaryFields: ['letter', 'name', 'abbrev']
  }
]

export const adminResources: ResourceConfig[] = [
  {
    key: 'users',
    label: 'Usuários',
    path: '/users',
    access: 'admin',
    primaryFields: ['email', 'username', 'is_staff', 'is_admin'],
    writeFields: ['email', 'username', 'name', 'is_staff', 'is_admin', 'is_active']
  },
  {
    key: 'mail',
    label: 'Fila de e-mail',
    path: '/mail',
    access: 'staff',
    primaryFields: ['subject', 'status', 'created_at']
  },
  {
    key: 'media-reviews',
    label: 'Avaliações de mídia',
    path: '/media-reviews',
    entityType: 'media_review',
    access: 'staff',
    primaryFields: ['media_item_id', 'decision', 'created_at']
  },
  {
    key: 'freight-car-categories',
    label: 'Categorias de vagões',
    path: '/freight-car-categories',
    entityType: 'freight_car_category',
    access: 'staff',
    primaryFields: ['letter', 'name']
  },
  {
    key: 'freight-car-types',
    label: 'Tipos de vagões',
    path: '/freight-car-types',
    entityType: 'freight_car_type',
    access: 'staff',
    primaryFields: ['letters', 'name']
  },
  {
    key: 'freight-car-gross-weight-types',
    label: 'Peso bruto de vagões',
    path: '/freight-car-gross-weight-types',
    entityType: 'freight_car_gross_weight_type',
    access: 'staff',
    primaryFields: ['letter', 'name']
  },
  {
    key: 'locomotive-designs',
    label: 'Modelos de locomotivas',
    path: '/locomotive-designs',
    entityType: 'locomotive_design',
    access: 'staff',
    primaryFields: ['name', 'manufacturer_id']
  },
  {
    key: 'passenger-car-types',
    label: 'Tipos de carros',
    path: '/passenger-car-types',
    entityType: 'passenger_car_type',
    access: 'staff',
    primaryFields: ['name']
  },
  {
    key: 'passenger-car-materials',
    label: 'Materiais de carros',
    path: '/passenger-car-materials',
    entityType: 'passenger_car_material',
    access: 'staff',
    primaryFields: ['name']
  },
  {
    key: 'non-revenue-car-types',
    label: 'Tipos de veículos de serviço',
    path: '/non-revenue-car-types',
    entityType: 'non_revenue_car_type',
    access: 'staff',
    primaryFields: ['name']
  }
]

export const allResources = [...publicResources, ...domainResources, ...adminResources]

export const nestedResourceEntityTypes: Record<string, ResourceConfig> = {
  location_city: {
    key: 'location-city',
    label: 'Cidade',
    path: '/states/:state_id/cities',
    entityType: 'location_city',
    access: 'admin',
    primaryFields: ['name', 'ibge_id', 'id'],
    writeFields: ['name', 'ibge_id'],
    relations: []
  },
  sigo_series_information: {
    key: 'sigo-series-information',
    label: 'Séries SIGO',
    path: '/information/:information_id/sigo-series',
    entityType: 'sigo_series_information',
    access: 'staff',
    primaryFields: ['manufacturer_id', 'sigo_regional_id', 'sigo_number', 'id'],
    writeFields: ['manufacturer_id', 'sigo_regional_id', 'sigo_number', 'status'],
    relations: []
  },
  company_paint_scheme_information: {
    key: 'company-paint-scheme-information',
    label: 'Informações da pintura',
    path: '/companies/:company_id/paint-schemes/:paint_scheme_id/information',
    entityType: 'company_paint_scheme_information',
    access: 'public',
    primaryFields: ['title', 'content', 'status', 'id'],
    writeFields: ['information_id'],
    relations: []
  },
  route_section_information: {
    key: 'route-section-information',
    label: 'Informações da seção',
    path: '/routes/:route_id/sections/:section_id/information',
    entityType: 'route_section_information',
    access: 'public',
    primaryFields: ['title', 'content', 'status', 'id'],
    writeFields: ['information_id'],
    relations: []
  },
  route_section: {
    key: 'route-section',
    label: 'Seções',
    path: '/routes/:route_id/sections',
    entityType: 'route_section',
    access: 'staff',
    primaryFields: ['name', 'status', 'id'],
    writeFields: ['name', 'status'],
    relations: [
      {
        key: 'information',
        label: 'Informações',
        pathSuffix: 'information',
        parentParam: 'section_id',
        access: 'public',
        primaryFields: ['title', 'content', 'status', 'id'],
        writeFields: ['information_id']
      },
      {
        key: 'locations',
        label: 'Locais da seção',
        pathSuffix: 'locations',
        parentParam: 'section_id',
        access: 'staff',
        primaryFields: ['location_id', 'location_route_order', 'id'],
        writeFields: ['location_id', 'location_route_order']
      },
      {
        key: 'paths',
        label: 'Linhas da seção',
        pathSuffix: 'paths',
        parentParam: 'section_id',
        access: 'staff',
        primaryFields: ['path_id', 'id'],
        writeFields: ['path_id']
      }
    ]
  },
  route_section_location: {
    key: 'route-section-location',
    label: 'Local da seção',
    path: '/routes/:route_id/sections/:section_id/locations',
    entityType: 'route_section_location',
    access: 'staff',
    primaryFields: ['location_id', 'location_route_order', 'id'],
    writeFields: ['location_id', 'location_route_order'],
    relations: [
      {
        key: 'kilometers',
        label: 'Marcos quilométricos',
        pathSuffix: 'kilometers',
        parentParam: 'section_location_id',
        access: 'staff',
        primaryFields: ['kilometer', 'id'],
        writeFields: ['kilometer', 'is_reference']
      }
    ]
  }
}

export function findResource(key: string) {
  return allResources.find((resource) => resource.key === key)
}

export function resourceForEntityType(entityType: string) {
  return (
    allResources.find((resource) => resource.entityType === entityType) ??
    nestedResourceEntityTypes[entityType]
  )
}
