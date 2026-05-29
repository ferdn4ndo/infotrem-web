export type LinkMap = Record<string, string>

export type PaginatedResponse<T> = {
  items: T[]
  count: number
  _links?: LinkMap
}

export type ListParams = {
  limit?: number
  offset?: number
}
