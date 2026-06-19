import { apiClient } from '@/services/http/api-client'
import type { EntityRow } from '@/types/domain/common.type'

export type InformationSummary = {
  information?: EntityRow | null
  effects?: EntityRow[]
  vote_summary?: EntityRow | null
  votes_summary?: EntityRow | null
  votes?: EntityRow[]
  current_user_vote?: EntityRow | null
  current_vote?: EntityRow | null
}

export type CompanySummary = {
  company?: EntityRow | null
  information?: EntityRow[]
  paint_schemes?: EntityRow[]
  [key: string]: unknown
}

export function getInformationSummary(informationId: string) {
  return apiClient.get<InformationSummary>(`/information/${informationId}/summary`)
}

export function getLocationSummary(locationId: string) {
  return apiClient.get<EntityRow>(`/locations/${locationId}/summary`)
}

export function getRollingStockSummary(rollingStockId: string) {
  return apiClient.get<EntityRow>(`/rolling-stock/${rollingStockId}/summary`)
}

export function getCompanySummary(companyId: string) {
  return apiClient.get<CompanySummary>(`/companies/${companyId}/summary`)
}

export function getRouteTree(routeId: string) {
  return apiClient.get<EntityRow>(`/routes/${routeId}/tree`)
}
