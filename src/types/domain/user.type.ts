import type { EntityRow } from './common.type'

export type CurrentUser = EntityRow & {
  id: string
  username?: string
  name?: string
  email?: string
  avatar_url?: string
  is_staff?: boolean
  is_admin?: boolean
  is_active?: boolean
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  password: string
  username?: string
  name?: string
}

export type LoginResponse = EntityRow & {
  token?: string
  key?: string
  auth_token?: string
}
