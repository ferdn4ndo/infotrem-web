import { describe, expect, it } from 'vitest'

import router from '@/router'

function redirectFor(resource: string, id: string) {
  const record = router.getRoutes().find((route) => route.name === 'resource-detail')
  const guard = record?.beforeEnter
  if (typeof guard !== 'function') {
    throw new Error('resource-detail beforeEnter guard not found')
  }
  return guard.call(undefined, { params: { resource, id } } as never, {} as never, () => undefined)
}

describe('resource-detail redirects', () => {
  it('redirects domain resources to bespoke detail views', () => {
    expect(redirectFor('companies', 'company-1')).toEqual({
      name: 'company-detail',
      params: { id: 'company-1' }
    })
    expect(redirectFor('locations', 'location-1')).toEqual({
      name: 'location-detail',
      params: { id: 'location-1' }
    })
    expect(redirectFor('rolling-stock', 'stock-1')).toEqual({
      name: 'rolling-stock-detail',
      params: { id: 'stock-1' }
    })
    expect(redirectFor('routes', 'route-1')).toEqual({
      name: 'route-detail',
      params: { id: 'route-1' }
    })
  })
})
