import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppCheckbox from '@/components/common/AppCheckbox.vue'

describe('AppCheckbox', () => {
  it('emits checked state changes', async () => {
    const wrapper = mount(AppCheckbox, {
      props: { modelValue: false }
    })

    await wrapper.get('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })
})
