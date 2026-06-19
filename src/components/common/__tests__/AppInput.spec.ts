import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppInput from '@/components/common/AppInput.vue'

describe('AppInput', () => {
  it('emits v-model updates', async () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: '' }
    })

    await wrapper.get('input').setValue('InfoTrem')
    expect(wrapper.emitted('update:modelValue')).toEqual([['InfoTrem']])
  })

  it('respects disabled prop', () => {
    const wrapper = mount(AppInput, {
      props: { modelValue: 'x', disabled: true }
    })

    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
  })
})
