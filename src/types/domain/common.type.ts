export type EntityRow = Record<string, unknown>

export type EntityId = string

export type EntityType =
  | 'album'
  | 'comment'
  | 'company'
  | 'company_paint_scheme'
  | 'freight_car_category'
  | 'freight_car_type'
  | 'information'
  | 'location'
  | 'location_city'
  | 'location_state'
  | 'manufacturer'
  | 'media'
  | 'path'
  | 'route'
  | 'route_section'
  | 'rolling_stock'
  | string
