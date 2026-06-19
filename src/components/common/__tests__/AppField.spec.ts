import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppField from '@/components/common/AppField.vue'

describe('AppField', () => {
  it('links label and slotted control attributes', () => {
    const wrapper = mount(AppField, {
      props: {
        label: 'Nome',
        hint: 'Informe seu nome completo',
        error: 'Campo obrigatório',
        required: true
      },
      slots: {
        default:
          '<template #default="{ id, required, ariaInvalid, ariaDescribedby }"><input :id="id" :required="required" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedby" /></template>'
      }
    })

    const label = wrapper.get('label')
    const input = wrapper.get('input')
    expect(label.attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toContain('-hint')
    expect(input.attributes('aria-describedby')).toContain('-error')
  })
})
