import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import EmptyState from '@/components/common/EmptyState.vue'

describe('EmptyState', () => {
  it('renders title and description', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Nada encontrado',
        description: 'Ajuste os filtros para continuar.'
      },
      global: {
        stubs: {
          FontAwesomeIcon: { template: '<i />' }
        }
      }
    })

    expect(wrapper.text()).toContain('Nada encontrado')
    expect(wrapper.text()).toContain('Ajuste os filtros')
  })

  it('renders action slot content', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: 'Sem itens'
      },
      slots: {
        action: '<button>Atualizar</button>'
      },
      global: {
        stubs: {
          FontAwesomeIcon: { template: '<i />' }
        }
      }
    })

    expect(wrapper.text()).toContain('Atualizar')
  })
})
