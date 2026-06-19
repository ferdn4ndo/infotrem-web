import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppButton from '@/components/common/AppButton.vue'

describe('AppButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Salvar'
      }
    })

    expect(wrapper.text()).toContain('Salvar')
  })

  it('applies variant and disabled props', () => {
    const wrapper = mount(AppButton, {
      props: {
        variant: 'danger',
        disabled: true
      }
    })

    expect(wrapper.classes()).toContain('AppButton--danger')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
