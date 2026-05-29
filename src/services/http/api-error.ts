import type { ApiErrorBody } from '@/types/api/errors.type'

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | unknown

  constructor(status: number, body: ApiErrorBody | unknown, fallbackMessage: string) {
    const message =
      typeof body === 'object' && body !== null
        ? ((body as ApiErrorBody).detail ?? (body as ApiErrorBody).message ?? fallbackMessage)
        : fallbackMessage

    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}
