import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from '@/App.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/next', component: { template: '<div>next</div>' } }
    ]
  })
}

function mountApp() {
  const router = createTestRouter()

  const wrapper = mount(App, {
    global: {
      plugins: [router],
      stubs: {
        TheHeader: {
          emits: ['menu-button-click', 'profile-chevron-click'],
          template:
            '<button data-cy="toggle-menu" @click="$emit(\'menu-button-click\')">menu</button>'
        },
        SideMenu: {
          emits: ['navigate'],
          template: '<aside data-cy="side-menu">menu</aside>'
        },
        ProfileCollapseCard: true
      }
    }
  })

  return { wrapper, router }
}

describe('App shell drawer behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })
    )
  })

  it('closes drawer when backdrop is clicked', async () => {
    const { wrapper, router } = mountApp()
    await router.isReady()

    await wrapper.get('[data-cy="toggle-menu"]').trigger('click')
    expect(wrapper.find('[data-cy="side-menu"]').exists()).toBe(true)

    await wrapper.get('.MainContent-Backdrop').trigger('click')
    expect(wrapper.find('[data-cy="side-menu"]').exists()).toBe(false)
  })

  it('closes drawer on Escape and route change', async () => {
    const { wrapper, router } = mountApp()
    await router.isReady()

    await wrapper.get('[data-cy="toggle-menu"]').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-cy="side-menu"]').exists()).toBe(false)

    await wrapper.get('[data-cy="toggle-menu"]').trigger('click')
    await router.push('/next')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-cy="side-menu"]').exists()).toBe(false)
  })
})
