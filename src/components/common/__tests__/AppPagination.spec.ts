import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppPagination from '@/components/common/AppPagination.vue'

describe('AppPagination', () => {
  it('renders current and total page information', () => {
    const wrapper = mount(AppPagination, {
      props: {
        count: 50,
        limit: 24,
        offset: 24
      }
    })

    expect(wrapper.text()).toContain('Página 2 de 3')
  })

  it('emits offset changes when navigating between pages', async () => {
    const wrapper = mount(AppPagination, {
      props: {
        count: 50,
        limit: 24,
        offset: 0
      }
    })

    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('update:offset')).toEqual([[24]])
  })

  it('disables previous and next buttons at list boundaries', () => {
    const firstPage = mount(AppPagination, {
      props: {
        count: 10,
        limit: 24,
        offset: 0
      }
    })
    const firstButtons = firstPage.findAll('button')
    expect(firstButtons[0].attributes('disabled')).toBeDefined()
    expect(firstButtons[1].attributes('disabled')).toBeDefined()

    const lastPage = mount(AppPagination, {
      props: {
        count: 30,
        limit: 24,
        offset: 24
      }
    })
    const lastButtons = lastPage.findAll('button')
    expect(lastButtons[0].attributes('disabled')).toBeUndefined()
    expect(lastButtons[1].attributes('disabled')).toBeDefined()
  })
})
