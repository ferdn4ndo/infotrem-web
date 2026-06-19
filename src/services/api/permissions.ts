import { findResource, type ResourceConfig } from '@/services/api/resources'

type AuthLike = {
  isLoggedIn?: boolean | { value: boolean }
  isStaff?: boolean | { value: boolean }
  isAdmin?: boolean | { value: boolean }
}

function toBoolean(value: boolean | { value: boolean } | undefined) {
  if (typeof value === 'boolean') {
    return value
  }
  return Boolean(value?.value)
}

function resolveResource(resource: string | ResourceConfig) {
  if (typeof resource !== 'string') {
    return resource
  }
  return findResource(resource) ?? null
}

function hasReadAccess(access: ResourceConfig['access'], auth: AuthLike) {
  if (access === 'public') {
    return true
  }
  if (access === 'auth') {
    return toBoolean(auth.isLoggedIn)
  }
  if (access === 'staff') {
    return toBoolean(auth.isStaff)
  }
  return toBoolean(auth.isAdmin)
}

function hasWriteAccess(access: ResourceConfig['access'], auth: AuthLike) {
  if (access === 'public' || access === 'auth') {
    return toBoolean(auth.isLoggedIn)
  }
  if (access === 'staff') {
    return toBoolean(auth.isStaff)
  }
  return toBoolean(auth.isAdmin)
}

export function canRead(resource: string | ResourceConfig, auth: AuthLike) {
  const resolved = resolveResource(resource)
  if (!resolved) {
    return false
  }
  return hasReadAccess(resolved.access, auth)
}

export function canCreate(resource: string | ResourceConfig, auth: AuthLike) {
  const resolved = resolveResource(resource)
  if (!resolved) {
    return false
  }
  // OwnerCheck relations are evaluated by the backend; UI can only gate by role/auth scope.
  return hasWriteAccess(resolved.access, auth)
}

export function canEdit(resource: string | ResourceConfig, auth: AuthLike) {
  const resolved = resolveResource(resource)
  if (!resolved) {
    return false
  }
  // OwnerCheck relations are evaluated by the backend; UI can only gate by role/auth scope.
  return hasWriteAccess(resolved.access, auth)
}

export function canDelete(resource: string | ResourceConfig, auth: AuthLike) {
  const resolved = resolveResource(resource)
  if (!resolved) {
    return false
  }
  // OwnerCheck relations are evaluated by the backend; UI can only gate by role/auth scope.
  return hasWriteAccess(resolved.access, auth)
}
