import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppTextarea from '@/components/common/AppTextarea.vue'

describe('AppTextarea', () => {
  it('emits v-model updates', async () => {
    const wrapper = mount(AppTextarea, {
      props: { modelValue: '' }
    })

    await wrapper.get('textarea').setValue('Texto')
    expect(wrapper.emitted('update:modelValue')).toEqual([['Texto']])
  })
})
