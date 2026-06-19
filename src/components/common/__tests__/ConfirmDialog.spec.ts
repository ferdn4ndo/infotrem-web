import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  it('emits cancel when escape is pressed', async () => {
    const wrapper = mount(ConfirmDialog, {
      attachTo: document.body,
      props: { modelValue: true }
    })

    await wrapper.get('.ConfirmDialog-Overlay').trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })

  it('emits confirm when confirm button is clicked', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true }
    })

    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('blocks background focus and restores trigger focus on close', async () => {
    const Host = defineComponent({
      components: { ConfirmDialog },
      setup() {
        const open = ref(false)
        return { open }
      },
      template: `
        <div>
          <button id="trigger" @click="open = true">Abrir</button>
          <ConfirmDialog v-model="open" />
        </div>
      `
    })

    const wrapper = mount(Host, { attachTo: document.body })
    const trigger = wrapper.get('#trigger')
    ;(trigger.element as HTMLElement).focus()
    await trigger.trigger('click')
    await nextTick()

    expect(trigger.attributes('inert')).toBeDefined()

    await wrapper.getComponent(ConfirmDialog).findAll('button')[0].trigger('click')
    await nextTick()

    expect(trigger.attributes('inert')).toBeUndefined()
    expect(document.activeElement).toBe(trigger.element)
  })
})
