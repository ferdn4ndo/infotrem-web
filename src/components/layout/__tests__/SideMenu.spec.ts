import { mount, RouterLinkStub } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import SideMenu from '@/components/layout/SideMenu.vue'
import { useAuthStore } from '@/stores/auth.store'

describe('SideMenu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hides auth-only links for logged-out users', () => {
    const auth = useAuthStore()
    auth.user = null
    auth.token = null

    const wrapper = mount(SideMenu, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          'font-awesome-icon': true
        }
      }
    })

    expect(wrapper.text()).not.toContain('Minha conta')
    expect(wrapper.text()).not.toContain('Alterar senha')
    expect(wrapper.text()).not.toContain('Enviar mídia')
    expect(wrapper.text()).not.toContain('Administração')
  })

  it('hides admin links for non-staff users', () => {
    const auth = useAuthStore()
    auth.token = 'token-user'
    auth.user = { id: 'user-1', is_staff: false, is_admin: false }

    const wrapper = mount(SideMenu, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          'font-awesome-icon': true
        }
      }
    })

    expect(wrapper.text()).not.toContain('Administração')
  })

  it('shows admin links for staff users', () => {
    const auth = useAuthStore()
    auth.token = 'token-staff'
    auth.user = { id: 'staff-1', is_staff: true, is_admin: false }

    const wrapper = mount(SideMenu, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          'font-awesome-icon': true
        }
      }
    })

    expect(wrapper.text()).toContain('Administração')
    expect(wrapper.text()).toContain('Operações')
  })
})
