import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RelationManager from '@/components/common/RelationManager.vue'

const mocks = vi.hoisted(() => ({
  listNested: vi.fn(),
  createNested: vi.fn(),
  deleteNested: vi.fn(),
  canCreate: vi.fn(),
  canEdit: vi.fn(),
  canDelete: vi.fn(),
  auth: {
    isLoggedIn: true,
    isStaff: true,
    isAdmin: false,
    user: { id: 'user-1' }
  }
}))

vi.mock('@/services/api/social.api', () => ({
  listNested: mocks.listNested,
  createNested: mocks.createNested,
  deleteNested: mocks.deleteNested
}))

vi.mock('@/services/api/permissions', () => ({
  canCreate: mocks.canCreate,
  canEdit: mocks.canEdit,
  canDelete: mocks.canDelete
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => ({ params: { id: 'route-1' } })
  }
})

describe('RelationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists related rows and allows delete', async () => {
    mocks.canCreate.mockReturnValue(true)
    mocks.canEdit.mockReturnValue(true)
    mocks.canDelete.mockReturnValue(true)
    mocks.listNested.mockResolvedValue({ items: [{ id: 'row-1', name: 'Relacionada' }], count: 1 })
    mocks.deleteNested.mockResolvedValue({})

    const wrapper = mount(RelationManager, {
      props: {
        relation: {
          key: 'information',
          label: 'Informações',
          pathSuffix: 'information',
          parentParam: 'company_id',
          access: 'public',
          primaryFields: ['name'],
          writeFields: ['name']
        },
        parentResource: {
          key: 'companies',
          label: 'Empresas',
          path: '/companies',
          access: 'public',
          primaryFields: ['name']
        },
        parentId: 'company-1'
      }
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Relacionada')
    const deleteButton = wrapper
      .findAll('button')
      .find((button) => button.text().trim().toLowerCase() === 'excluir')
    if (!deleteButton) {
      throw new Error('Delete button not found')
    }
    await deleteButton.trigger('click')
    await flushPromises()
    const confirmDialog = wrapper.findComponent({ name: 'ConfirmDialog' })
    await confirmDialog.vm.$emit('confirm')
    await flushPromises()

    expect(mocks.deleteNested).toHaveBeenCalledWith('/companies/company-1', 'information', 'row-1')
    expect(mocks.listNested).toHaveBeenCalledWith(
      '/companies/company-1',
      'information',
      expect.objectContaining({ limit: 12, offset: 0 }),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
  })

  it('toggles owned relation by deleting existing row first', async () => {
    mocks.canCreate.mockReturnValue(true)
    mocks.canEdit.mockReturnValue(false)
    mocks.canDelete.mockReturnValue(false)
    mocks.listNested.mockResolvedValue({
      items: [{ id: 'like-1', liked_by_id: 'user-1' }],
      count: 1
    })
    mocks.deleteNested.mockResolvedValue({})

    const wrapper = mount(RelationManager, {
      props: {
        relation: {
          key: 'likes',
          label: 'Curtir',
          pathSuffix: 'likes',
          parentParam: 'media_id',
          access: 'auth',
          primaryFields: ['id'],
          kind: 'owned-toggle'
        },
        parentResource: {
          key: 'media',
          label: 'Mídia',
          path: '/media',
          access: 'public',
          primaryFields: ['title']
        },
        parentId: 'media-1'
      }
    })

    await flushPromises()
    const toggleButton = wrapper
      .findAll('button')
      .find((button) => button.text().toLowerCase().includes('remover curtir'))
    if (!toggleButton) {
      throw new Error('Toggle button not found')
    }
    await toggleButton.trigger('click')
    await flushPromises()

    expect(mocks.deleteNested).toHaveBeenCalledWith('/media/media-1', 'likes', 'like-1')
    expect(mocks.createNested).not.toHaveBeenCalled()
  })

  it('creates owned relation when current user has no existing row', async () => {
    mocks.canCreate.mockReturnValue(true)
    mocks.canEdit.mockReturnValue(false)
    mocks.canDelete.mockReturnValue(false)
    mocks.listNested.mockResolvedValue({
      items: [{ id: 'like-2', liked_by_id: 'user-2' }],
      count: 1
    })
    mocks.createNested.mockResolvedValue({})

    const wrapper = mount(RelationManager, {
      props: {
        relation: {
          key: 'likes',
          label: 'Curtir',
          pathSuffix: 'likes',
          parentParam: 'media_id',
          access: 'auth',
          primaryFields: ['id'],
          kind: 'owned-toggle'
        },
        parentResource: {
          key: 'media',
          label: 'Mídia',
          path: '/media',
          access: 'public',
          primaryFields: ['title']
        },
        parentId: 'media-1'
      }
    })

    await flushPromises()
    const toggleButton = wrapper
      .findAll('button')
      .find((button) => button.text().trim().toLowerCase() === 'curtir')
    if (!toggleButton) {
      throw new Error('Toggle button not found')
    }
    await toggleButton.trigger('click')
    await flushPromises()

    expect(mocks.createNested).toHaveBeenCalledWith('/media/media-1', 'likes')
    expect(mocks.deleteNested).not.toHaveBeenCalledWith('/media/media-1', 'likes', 'like-2')
  })
})
