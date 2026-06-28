import { ApiError } from './api-error'
import { toSearchParams } from './pagination'

type RequestOptions = {
  body?: unknown
  headers?: HeadersInit
  query?: Record<string, string | number | boolean | null | undefined>
  signal?: AbortSignal
}

let authTokenProvider: (() => string | null) | null = null
const configuredApiBaseUrl = import.meta.env.VITE_INFOTREM_API_BASE_URL?.trim()

if (!configuredApiBaseUrl) {
  throw new Error('Missing required env VITE_INFOTREM_API_BASE_URL')
}

export function setAuthTokenProvider(provider: () => string | null) {
  authTokenProvider = provider
}

function apiPath(path: string, query?: RequestOptions['query']) {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const normalizedBaseUrl = configuredApiBaseUrl.endsWith('/')
    ? configuredApiBaseUrl
    : `${configuredApiBaseUrl}/`
  const requestUrl = new URL(normalizedPath, normalizedBaseUrl)
  const searchParams = query ? toSearchParams(query) : null

  if (searchParams) {
    requestUrl.search = searchParams.toString()
  }

  return requestUrl.toString()
}

async function parseBody(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  const text = await response.text()
  if (!text) {
    return undefined
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json') || text.startsWith('{') || text.startsWith('[')) {
    return JSON.parse(text)
  }

  return text
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = authTokenProvider?.()

  if (token) {
    headers.set('Authorization', `Token ${token}`)
  }

  let body: BodyInit | undefined
  if (options.body instanceof FormData) {
    body = options.body
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const response = await fetch(apiPath(path, options.query), {
    method,
    headers,
    body,
    signal: options.signal
  })
  const parsedBody = await parseBody(response)

  if (!response.ok) {
    throw new ApiError(response.status, parsedBody, `${method} ${path} failed`)
  }

  return parsedBody as T
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>('GET', path, options)
  },
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>('POST', path, { ...options, body })
  },
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>('PUT', path, { ...options, body })
  },
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>('PATCH', path, { ...options, body })
  },
  delete<T = undefined>(path: string, options?: RequestOptions) {
    return request<T>('DELETE', path, options)
  }
}
