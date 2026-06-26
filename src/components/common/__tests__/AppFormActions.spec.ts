import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppFormActions from '@/components/common/AppFormActions.vue'

describe('AppFormActions', () => {
  it('renders submit/cancel actions and emits cancel', async () => {
    const wrapper = mount(AppFormActions)
    const buttons = wrapper.findAll('button')

    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toContain('Salvar')
    expect(buttons[1].text()).toContain('Cancelar')

    await buttons[1].trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
