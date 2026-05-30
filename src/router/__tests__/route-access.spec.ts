import { describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'

import { resolveRouteAccess } from '@/router'
import type { useAuthStore } from '@/stores/auth.store'

type GuardAuth = ReturnType<typeof useAuthStore>

function route(overrides: Partial<RouteLocationNormalized>): RouteLocationNormalized {
  return {
    name: 'home',
    fullPath: '/',
    meta: {},
    params: {},
    query: {},
    path: '/',
    hash: '',
    matched: [],
    redirectedFrom: undefined,
    ...overrides
  } as RouteLocationNormalized
}

function auth(overrides: Partial<GuardAuth> = {}): GuardAuth {
  return {
    token: null,
    user: null,
    isLoggedIn: false,
    isStaff: false,
    isAdmin: false,
    refreshMe: vi.fn(),
    logout: vi.fn(),
    ...overrides
  } as unknown as GuardAuth
}

describe('resolveRouteAccess', () => {
  it('redirects anonymous users from authenticated routes', async () => {
    const redirect = await resolveRouteAccess(
      route({ name: 'contact', fullPath: '/contact', meta: { requiresAuth: true } }),
      auth()
    )

    expect(redirect).toEqual({ name: 'login', query: { redirect: '/contact' } })
  })

  it('blocks non-staff users from staff routes', async () => {
    const redirect = await resolveRouteAccess(
      route({
        name: 'admin-operations',
        fullPath: '/admin/operations',
        meta: { requiresStaff: true }
      }),
      auth({ token: 'token', user: { id: 'user-1' }, isLoggedIn: true })
    )

    expect(redirect).toEqual({ name: 'home', query: { redirect: '/admin/operations' } })
  })

  it('allows staff users on staff routes and blocks admin-only resources', async () => {
    const staffAuth = auth({
      token: 'token',
      user: { id: 'staff-1' },
      isLoggedIn: true,
      isStaff: true,
      isAdmin: false
    })

    await expect(
      resolveRouteAccess(
        route({
          name: 'admin-operations',
          fullPath: '/admin/operations',
          meta: { requiresStaff: true }
        }),
        staffAuth
      )
    ).resolves.toBeUndefined()

    await expect(
      resolveRouteAccess(
        route({
          name: 'admin-resource',
          fullPath: '/admin/resources/users',
          params: { resource: 'users' }
        }),
        staffAuth
      )
    ).resolves.toEqual({ name: 'home', query: { redirect: '/admin/resources/users' } })
  })

  it('allows admin users on admin-only resources', async () => {
    await expect(
      resolveRouteAccess(
        route({
          name: 'admin-resource',
          fullPath: '/admin/resources/users',
          params: { resource: 'users' }
        }),
        auth({
          token: 'token',
          user: { id: 'admin-1' },
          isLoggedIn: true,
          isStaff: true,
          isAdmin: true
        })
      )
    ).resolves.toBeUndefined()
  })

  it('logs out and redirects when auth hydration fails', async () => {
    const fakeAuth = auth({
      token: 'stale-token',
      user: null,
      isLoggedIn: true,
      refreshMe: vi.fn().mockRejectedValue(new Error('expired')),
      logout: vi.fn(function (this: { token: string | null; isLoggedIn: boolean }) {
        this.token = null
        this.isLoggedIn = false
      })
    })

    const redirect = await resolveRouteAccess(
      route({ name: 'contact', fullPath: '/contact', meta: { requiresAuth: true } }),
      fakeAuth
    )

    expect(fakeAuth.refreshMe).toHaveBeenCalled()
    expect(fakeAuth.logout).toHaveBeenCalled()
    expect(redirect).toEqual({ name: 'login', query: { redirect: '/contact' } })
  })
})
