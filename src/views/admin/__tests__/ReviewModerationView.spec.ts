import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ReviewModerationView from '@/views/admin/ReviewModerationView.vue'

const mocks = vi.hoisted(() => ({
  listResource: vi.fn(),
  updateNested: vi.fn()
}))

vi.mock('@/services/api/resources.api', () => ({
  listResource: mocks.listResource
}))

vi.mock('@/services/api/social.api', () => ({
  updateNested: mocks.updateNested
}))

describe('ReviewModerationView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.updateNested.mockResolvedValue({})
    mocks.listResource.mockResolvedValue({
      items: [
        {
          id: 'review-1',
          media_item_id: 'media-1',
          decision: 'approve',
          comment: 'Tudo certo',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z'
        }
      ],
      count: 1
    })
  })

  it('renders loading and then moderation rows', async () => {
    let resolveList!: (value: { items: Array<Record<string, string>>; count: number }) => void
    mocks.listResource.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveList = resolve
        })
    )

    const wrapper = mount(ReviewModerationView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Carregando fila de moderação')

    resolveList({
      items: [
        {
          id: 'review-1',
          media_item_id: 'media-1',
          decision: 'approve',
          comment: 'Tudo certo',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z'
        }
      ],
      count: 1
    })
    await flushPromises()

    expect(wrapper.text()).toContain('Mídia:')
    expect(wrapper.text()).toContain('#media-1')
    expect(wrapper.text()).toContain('Aprovar')
    expect(wrapper.text()).toContain('Precisa de ajustes')
    expect(wrapper.text()).toContain('Rejeitar')
  })

  it('shows empty state when queue is empty', async () => {
    mocks.listResource.mockResolvedValueOnce({ items: [], count: 0 })

    const wrapper = mount(ReviewModerationView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Sem avaliações pendentes')
  })

  it('shows error state when list request fails', async () => {
    mocks.listResource.mockRejectedValueOnce(new Error('Falha na moderação'))

    const wrapper = mount(ReviewModerationView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Falha na moderação')
  })

  it('approves review through nested media PATCH route', async () => {
    const wrapper = mount(ReviewModerationView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' }
        }
      }
    })
    await flushPromises()

    await wrapper.get('[data-cy="moderation-approve"]').trigger('click')
    await flushPromises()

    expect(mocks.updateNested).toHaveBeenCalledWith('/media/media-1', 'reviews', 'review-1', {
      decision: 'approve'
    })
  })
})
