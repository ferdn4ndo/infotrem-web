import { apiClient } from '@/services/http/api-client'
import type { EntityRow } from '@/types/domain/common.type'

export function listNested(parentPath: string, relation: string) {
  return apiClient.get<{ items: EntityRow[]; count: number }>(`${parentPath}/${relation}`)
}

export function createNested(parentPath: string, relation: string, payload: EntityRow = {}) {
  return apiClient.post<EntityRow>(`${parentPath}/${relation}`, payload)
}

export function updateNested(parentPath: string, relation: string, id: string, payload: EntityRow) {
  return apiClient.patch<EntityRow>(`${parentPath}/${relation}/${id}`, payload)
}

export function deleteNested(parentPath: string, relation: string, id: string) {
  return apiClient.delete(`${parentPath}/${relation}/${id}`)
}
