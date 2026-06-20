import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AdminResourceView from '@/views/admin/AdminResourceView.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { resource: 'companies' } },
  listResource: vi.fn(),
  deleteResource: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
  auth: { isStaff: true, isAdmin: true },
  findResource: vi.fn()
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route
  }
})

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

vi.mock('@/services/api/resources', async () => {
  const actual = await vi.importActual<typeof import('@/services/api/resources')>(
    '@/services/api/resources'
  )
  return {
    ...actual,
    findResource: mocks.findResource
  }
})

vi.mock('@/services/api/resources.api', () => ({
  listResource: mocks.listResource,
  deleteResource: mocks.deleteResource,
  createResource: mocks.createResource,
  updateResource: mocks.updateResource
}))

describe('AdminResourceView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findResource.mockReturnValue({
      key: 'companies',
      label: 'Empresas',
      path: '/companies',
      access: 'staff',
      primaryFields: ['name', 'id'],
      writeFields: ['name']
    })
    mocks.listResource.mockResolvedValue({
      items: [{ id: 'company-1', name: 'Rumo' }],
      count: 1
    })
    mocks.deleteResource.mockResolvedValue({})
  })

  it('confirms destructive actions through ConfirmDialog', async () => {
    const wrapper = mount(AdminResourceView, {
      global: {
        stubs: {
          ResourceForm: { template: '<form />' }
        }
      }
    })
    await flushPromises()

    await wrapper.get('[data-cy="admin-delete"]').trigger('click')
    const dialog = wrapper.getComponent(ConfirmDialog)
    expect(dialog.props('modelValue')).toBe(true)

    await dialog.vm.$emit('confirm')
    await flushPromises()

    expect(mocks.deleteResource).toHaveBeenCalledWith('/companies', 'company-1')
  })
})
