import { apiClient } from '@/services/http/api-client'
import type { ListParams, PaginatedResponse } from '@/types/api/pagination.type'
import type { EntityRow } from '@/types/domain/common.type'

export function listResource<T extends EntityRow = EntityRow>(
  path: string,
  params: ListParams = {}
) {
  return apiClient.get<PaginatedResponse<T>>(path, { query: params })
}

export function getResource<T extends EntityRow = EntityRow>(path: string, id: string) {
  return apiClient.get<T>(`${path}/${id}`)
}

export function createResource<T extends EntityRow = EntityRow>(path: string, payload: EntityRow) {
  return apiClient.post<T>(path, payload)
}

export function updateResource<T extends EntityRow = EntityRow>(
  path: string,
  id: string,
  payload: EntityRow
) {
  return apiClient.patch<T>(`${path}/${id}`, payload)
}

export function deleteResource(path: string, id: string) {
  return apiClient.delete(`${path}/${id}`)
}
