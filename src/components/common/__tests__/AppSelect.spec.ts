import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppSelect from '@/components/common/AppSelect.vue'

describe('AppSelect', () => {
  it('renders options and emits selected value', async () => {
    const wrapper = mount(AppSelect, {
      props: {
        modelValue: '',
        options: [
          { value: '', label: 'Selecione' },
          { value: 'sp', label: 'São Paulo' }
        ]
      }
    })

    await wrapper.get('select').setValue('sp')
    expect(wrapper.emitted('update:modelValue')).toEqual([['sp']])
    expect(wrapper.text()).toContain('São Paulo')
  })
})
