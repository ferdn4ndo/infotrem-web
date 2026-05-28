import type { ListParams } from '@/types/api/pagination.type'

export function toSearchParams(
  params: Record<string, string | number | boolean | null | undefined>
) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  return searchParams
}

export function withListParams(path: string, params: ListParams = {}) {
  const searchParams = toSearchParams(params)
  const query = searchParams.toString()

  return query ? `${path}?${query}` : path
}
