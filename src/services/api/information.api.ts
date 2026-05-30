import { apiClient } from '@/services/http/api-client'
import type { PaginatedResponse } from '@/types/api/pagination.type'
import type { EntityRow } from '@/types/domain/common.type'

export type InformationEffectPayload = {
  field_name: string
  old_value?: string | null
  new_value: string
}

export type InformationVotePayload = {
  value: -1 | 0 | 1
}

export function listInformationEffects(informationId: string) {
  return apiClient.get<PaginatedResponse<EntityRow>>(`/information/${informationId}/effects`)
}

export function createInformationEffect(informationId: string, payload: InformationEffectPayload) {
  return apiClient.post<EntityRow>(`/information/${informationId}/effects`, payload)
}

export function listInformationVotes(informationId: string) {
  return apiClient.get<PaginatedResponse<EntityRow>>(`/information/${informationId}/votes`)
}

export function createInformationVote(
  informationId: string,
  value: InformationVotePayload['value']
) {
  return apiClient.post<EntityRow>(`/information/${informationId}/votes`, { value })
}
