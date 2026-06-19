import { describe, expect, it } from 'vitest'

import { canCreate, canDelete, canEdit, canRead } from '@/services/api/permissions'

describe('permissions helpers', () => {
  const anonymous = { isLoggedIn: false, isStaff: false, isAdmin: false }
  const loggedIn = { isLoggedIn: true, isStaff: false, isAdmin: false }
  const staff = { isLoggedIn: true, isStaff: true, isAdmin: false }
  const admin = { isLoggedIn: true, isStaff: true, isAdmin: true }

  it('allows public read to anonymous users', () => {
    expect(canRead('media', anonymous)).toBe(true)
  })

  it('requires login for public writes', () => {
    expect(canCreate('media', anonymous)).toBe(false)
    expect(canCreate('media', loggedIn)).toBe(true)
    expect(canEdit('media', loggedIn)).toBe(true)
    expect(canDelete('media', loggedIn)).toBe(true)
  })

  it('gates staff resources by staff role', () => {
    expect(canRead('mail', loggedIn)).toBe(false)
    expect(canRead('mail', staff)).toBe(true)
    expect(canCreate('mail', staff)).toBe(true)
  })

  it('gates admin resources by admin role', () => {
    expect(canRead('users', staff)).toBe(false)
    expect(canRead('users', admin)).toBe(true)
    expect(canDelete('users', admin)).toBe(true)
  })
})
