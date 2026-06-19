import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AppCard from '@/components/common/AppCard.vue'

describe('AppCard', () => {
  it('renders default slot content', () => {
    const wrapper = mount(AppCard, {
      slots: {
        default: '<p>Conteudo do card</p>'
      }
    })

    expect(wrapper.text()).toContain('Conteudo do card')
  })

  it('applies selected padding variant', () => {
    const wrapper = mount(AppCard, {
      props: {
        padding: 'lg'
      }
    })

    expect(wrapper.classes()).toContain('AppCard--lg')
  })
})
