import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppSpinner from '@/components/common/AppSpinner.vue'

describe('AppSpinner', () => {
  it('renders with default size class', () => {
    const wrapper = mount(AppSpinner)

    expect(wrapper.classes()).toContain('AppSpinner--md')
  })

  it('renders with custom size class', () => {
    const wrapper = mount(AppSpinner, {
      props: {
        size: 'lg'
      }
    })

    expect(wrapper.classes()).toContain('AppSpinner--lg')
  })
})
