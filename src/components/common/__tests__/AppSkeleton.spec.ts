import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppSkeleton from '@/components/common/AppSkeleton.vue'

describe('AppSkeleton', () => {
  it('renders default skeleton', () => {
    const wrapper = mount(AppSkeleton)

    expect(wrapper.classes()).toContain('AppSkeleton')
  })

  it('applies custom dimensions', () => {
    const wrapper = mount(AppSkeleton, {
      props: {
        width: '40px',
        height: '12px'
      }
    })

    expect(wrapper.attributes('style')).toContain('width: 40px;')
    expect(wrapper.attributes('style')).toContain('height: 12px;')
  })
})
