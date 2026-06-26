import { apiClient } from '@/services/http/api-client'
import type { ListParams, PaginatedResponse } from '@/types/api/pagination.type'
import type { EntityRow } from '@/types/domain/common.type'

type RequestSignalOptions = {
  signal?: AbortSignal
}

export function listResource<T extends EntityRow = EntityRow>(
  path: string,
  params: ListParams = {},
  options: RequestSignalOptions = {}
) {
  return apiClient.get<PaginatedResponse<T>>(path, { query: params, signal: options.signal })
}

export function getResource<T extends EntityRow = EntityRow>(
  path: string,
  id: string,
  options: RequestSignalOptions = {}
) {
  return apiClient.get<T>(`${path}/${id}`, { signal: options.signal })
}

export function createResource<T extends EntityRow = EntityRow>(
  path: string,
  payload: EntityRow,
  options: RequestSignalOptions = {}
) {
  return apiClient.post<T>(path, payload, { signal: options.signal })
}

export function updateResource<T extends EntityRow = EntityRow>(
  path: string,
  id: string,
  payload: EntityRow,
  options: RequestSignalOptions = {}
) {
  return apiClient.patch<T>(`${path}/${id}`, payload, { signal: options.signal })
}

export function deleteResource(path: string, id: string, options: RequestSignalOptions = {}) {
  return apiClient.delete(`${path}/${id}`, { signal: options.signal })
}
