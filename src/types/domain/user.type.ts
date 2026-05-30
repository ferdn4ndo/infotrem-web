import type { EntityRow } from './common.type'

export type CurrentUser = EntityRow & {
  id: string
  username?: string
  name?: string
  email?: string
  avatar_url?: string
  cpf?: string
  birth_date?: string
  address?: string
  number?: string
  complement?: string
  zipcode?: string
  phone?: string
  city_id?: string
  state_id?: string
  is_staff?: boolean
  is_admin?: boolean
  is_active?: boolean
}

export type ProfileUpdatePayload = Pick<
  CurrentUser,
  | 'name'
  | 'cpf'
  | 'birth_date'
  | 'address'
  | 'number'
  | 'complement'
  | 'zipcode'
  | 'phone'
  | 'city_id'
  | 'state_id'
>

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
