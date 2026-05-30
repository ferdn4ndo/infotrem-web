import { apiClient } from '@/services/http/api-client'
import type { EntityRow } from '@/types/domain/common.type'

export type ContactPayload = {
  type?: string
  name?: string
  email?: string
  phone?: string
  message: string
  user_id?: string
}

export function submitContact(payload: ContactPayload) {
  return apiClient.post<EntityRow>('/contact', payload)
}
