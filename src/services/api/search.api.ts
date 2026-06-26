import { apiClient } from '@/services/http/api-client'
import type { EntityRow } from '@/types/domain/common.type'

export type SearchResultItem = EntityRow & {
  entity_type: string
  relevance: number
}

export type SearchResult = {
  q: string
  items: SearchResultItem[]
}

export function search(q: string, limit = 30, options: { signal?: AbortSignal } = {}) {
  return apiClient.get<SearchResult>('/search', { query: { q, limit }, signal: options.signal })
}
