import { apiClient } from '@/services/http/api-client'
import type {
  CurrentUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload
} from '@/types/domain/user.type'

export function login(payload: LoginPayload) {
  return apiClient.post<LoginResponse>('/login', payload)
}

export function register(payload: RegisterPayload) {
  return apiClient.post<Record<string, unknown>>('/register', payload)
}

export function me() {
  return apiClient.get<CurrentUser>('/me')
}

export function updateMe(payload: Partial<CurrentUser>) {
  return apiClient.patch<CurrentUser>('/me', payload)
}

export function changePassword(payload: Record<string, unknown>) {
  return apiClient.patch<Record<string, unknown>>('/me/password', payload)
}

export function resendEmailValidation() {
  return apiClient.post<Record<string, unknown>>('/email-validation/resend')
}

export function checkEmailValidation(userId: string, validationHash: string) {
  return apiClient.get<Record<string, unknown>>(
    `/email-validation/check/${userId}/${validationHash}`
  )
}
