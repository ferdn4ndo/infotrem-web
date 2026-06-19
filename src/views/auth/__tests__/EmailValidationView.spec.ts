import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import EmailValidationView from '@/views/auth/EmailValidationView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { userId: 'user-1', validationHash: 'hash-1' } },
  checkEmailValidation: vi.fn()
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route
  }
})

vi.mock('@/services/api/auth.api', () => ({
  checkEmailValidation: mocks.checkEmailValidation
}))

describe('EmailValidationView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.checkEmailValidation.mockResolvedValue({ message: 'E-mail validado com sucesso.' })
  })

  it('loads validation result on mount', async () => {
    const wrapper = mount(EmailValidationView)
    await flushPromises()

    expect(mocks.checkEmailValidation).toHaveBeenCalledWith('user-1', 'hash-1')
    expect(wrapper.text()).toContain('E-mail validado com sucesso.')
  })

  it('shows error state when validation fails', async () => {
    mocks.checkEmailValidation.mockRejectedValueOnce(new Error('Link inválido'))
    const wrapper = mount(EmailValidationView)
    await flushPromises()

    expect(wrapper.text()).toContain('Link inválido')
  })
})
