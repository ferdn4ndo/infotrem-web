import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StatusMessage from '@/components/common/StatusMessage.vue'

describe('StatusMessage', () => {
  it('renders loading state with spinner', () => {
    const wrapper = mount(StatusMessage, {
      props: {
        state: 'loading'
      }
    })

    expect(wrapper.findComponent({ name: 'AppSpinner' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('Carregando')
  })

  it('emits retry when retry button is clicked', async () => {
    const wrapper = mount(StatusMessage, {
      props: {
        state: 'error',
        message: 'Falhou'
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
