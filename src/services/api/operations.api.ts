import { apiClient } from '@/services/http/api-client'
import type { EntityRow } from '@/types/domain/common.type'

export function getHealth() {
  return apiClient.get<EntityRow>('/health')
}

export const docsLinks = [
  { label: 'Swagger JSON', href: '/api/docs/swagger.json' },
  { label: 'Swagger UI', href: '/api/docs/swagger' },
  { label: 'ReDoc', href: '/api/docs/redoc' },
  { label: 'OpenAPI', href: '/api/docs/openapi' }
]
