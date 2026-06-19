import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ResourceForm from '@/components/common/ResourceForm.vue'

const mocks = vi.hoisted(() => ({
  createResource: vi.fn(),
  updateResource: vi.fn()
}))

vi.mock('@/services/api/resources.api', () => ({
  createResource: mocks.createResource,
  updateResource: mocks.updateResource
}))

describe('ResourceForm', () => {
  it('validates required fields and submits a create payload', async () => {
    mocks.createResource.mockResolvedValueOnce({ id: 'row-1', name: 'Nova empresa' })
    const wrapper = mount(ResourceForm, {
      props: {
        resource: {
          key: 'companies',
          label: 'Empresas',
          path: '/companies',
          access: 'public',
          primaryFields: ['name'],
          writeFields: ['name', 'status']
        }
      }
    })

    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Campo obrigatório.')

    const nameInput = wrapper.find('input[type="text"]')
    const statusSelect = wrapper.find('select')
    await nameInput.setValue('Nova empresa')
    await statusSelect.setValue('active')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mocks.createResource).toHaveBeenCalledWith('/companies', {
      name: 'Nova empresa',
      status: 'active'
    })
    expect(wrapper.emitted('saved')).toBeTruthy()
  })

  it('submits patch payload in edit mode', async () => {
    mocks.updateResource.mockResolvedValueOnce({ id: 'row-2', name: 'Atualizada' })

    const wrapper = mount(ResourceForm, {
      props: {
        resource: {
          key: 'companies',
          label: 'Empresas',
          path: '/companies',
          access: 'public',
          primaryFields: ['name'],
          writeFields: ['name']
        },
        record: { id: 'row-2', name: 'Antiga' }
      }
    })

    await wrapper.find('input').setValue('Atualizada')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mocks.updateResource).toHaveBeenCalledWith('/companies', 'row-2', { name: 'Atualizada' })
  })

  it('uses pathOverride for nested create submissions', async () => {
    mocks.createResource.mockResolvedValueOnce({ id: 'paint-1', name: 'Azul' })

    const wrapper = mount(ResourceForm, {
      props: {
        resource: {
          key: 'paint-schemes',
          label: 'Pinturas',
          path: '/paint-schemes',
          access: 'public',
          primaryFields: ['name'],
          writeFields: ['name']
        },
        pathOverride: '/companies/company-1/paint-schemes'
      }
    })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('Azul')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(mocks.createResource).toHaveBeenCalledWith('/companies/company-1/paint-schemes', {
      name: 'Azul'
    })
  })
})
