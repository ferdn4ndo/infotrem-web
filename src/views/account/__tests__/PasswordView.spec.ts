import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PasswordView from '@/views/account/PasswordView.vue'

const mocks = vi.hoisted(() => ({
  changePassword: vi.fn()
}))

vi.mock('@/services/api/auth.api', () => ({
  changePassword: mocks.changePassword
}))

describe('PasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.changePassword.mockResolvedValue({ message: 'ok' })
  })

  it('submits password change as primary action', async () => {
    const wrapper = mount(PasswordView)

    await wrapper.get('[data-cy="password-current"]').setValue('senha-antiga')
    await wrapper.get('[data-cy="password-new"]').setValue('senha-nova')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(mocks.changePassword).toHaveBeenCalledWith({
      current_password: 'senha-antiga',
      password: 'senha-nova',
      new_password: 'senha-nova'
    })
    expect(wrapper.text()).toContain('Senha alterada.')
  })

  it('shows error feedback when request fails', async () => {
    mocks.changePassword.mockRejectedValueOnce(new Error('Erro senha'))
    const wrapper = mount(PasswordView)

    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Erro senha')
  })
})
