import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RegisterView from '@/views/auth/RegisterView.vue'

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  auth: {
    isLoading: false,
    isLoggedIn: false,
    errorMessage: null as string | null,
    register: vi.fn()
  }
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: mocks.push })
  }
})

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

describe('RegisterView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.isLoading = false
    mocks.auth.isLoggedIn = false
    mocks.auth.errorMessage = null
    mocks.auth.register.mockResolvedValue(undefined)
  })

  it('shows loading state from auth store', () => {
    mocks.auth.isLoading = true
    const wrapper = mount(RegisterView)

    expect(wrapper.text()).toContain('Criando conta e preparando seu acesso')
  })

  it('submits register payload and routes to login as primary action', async () => {
    const wrapper = mount(RegisterView)

    await wrapper.get('[data-cy="register-name"]').setValue('Usuário Teste')
    await wrapper.get('[data-cy="register-username"]').setValue('user-teste')
    await wrapper.get('[data-cy="register-email"]').setValue('user@teste.dev')
    await wrapper.get('[data-cy="register-password"]').setValue('123456')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(mocks.auth.register).toHaveBeenCalledWith({
      email: 'user@teste.dev',
      username: 'user-teste',
      name: 'Usuário Teste',
      password: '123456'
    })
    expect(mocks.push).toHaveBeenCalledWith({ name: 'login' })
  })

  it('renders backend error message from auth store', () => {
    mocks.auth.errorMessage = 'E-mail já existe'
    const wrapper = mount(RegisterView)

    expect(wrapper.text()).toContain('E-mail já existe')
  })
})
