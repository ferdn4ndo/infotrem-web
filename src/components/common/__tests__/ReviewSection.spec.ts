import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ReviewSection from '@/components/common/ReviewSection.vue'

const mocks = vi.hoisted(() => ({
  auth: {
    isLoggedIn: true,
    isStaff: false,
    isAdmin: false,
    user: { id: 'user-1' } as { id: string } | null
  },
  deleteNested: vi.fn(),
  updateNested: vi.fn()
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

vi.mock('@/services/api/social.api', () => ({
  deleteNested: mocks.deleteNested,
  updateNested: mocks.updateNested
}))

function reviewRow(overrides = {}) {
  return {
    id: 'review-1',
    decision: 'approve',
    comment: 'Looks good',
    created_by_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides
  }
}

function mountSection(overrides = {}) {
  return mount(ReviewSection, {
    props: {
      parentPath: '/media/media-1',
      items: [reviewRow(overrides)]
    }
  })
}

describe('ReviewSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.isLoggedIn = true
    mocks.auth.isStaff = false
    mocks.auth.isAdmin = false
    mocks.auth.user = { id: 'user-1' }
  })

  it('renders review decision and comment', () => {
    const wrapper = mountSection()

    expect(wrapper.text()).toContain('Aprovar')
    expect(wrapper.text()).toContain('Looks good')
  })

  it('allows review owners to edit and delete reviews', async () => {
    mocks.updateNested.mockResolvedValue({})
    mocks.deleteNested.mockResolvedValue({})
    const wrapper = mountSection()

    await wrapper.get('[data-cy="review-edit"]').trigger('click')
    await wrapper.get('select').setValue('needs_changes')
    await wrapper.get('textarea').setValue('Needs a source')
    await wrapper.get('form').trigger('submit')

    expect(mocks.updateNested).toHaveBeenCalledWith('/media/media-1', 'reviews', 'review-1', {
      decision: 'needs_changes',
      comment: 'Needs a source'
    })
    expect(wrapper.emitted('refresh')).toBeTruthy()

    await wrapper.get('[data-cy="review-delete"]').trigger('click')
    expect(mocks.deleteNested).toHaveBeenCalledWith('/media/media-1', 'reviews', 'review-1')
  })

  it('allows staff moderation quick decisions', async () => {
    mocks.auth.isStaff = true
    mocks.updateNested.mockResolvedValue({})
    const wrapper = mountSection({ created_by_id: 'user-2' })

    await wrapper.get('[data-cy="review-approve"]').trigger('click')

    expect(mocks.updateNested).toHaveBeenCalledWith('/media/media-1', 'reviews', 'review-1', {
      decision: 'approve'
    })
  })

  it('allows staff users to manage reviews they do not own', () => {
    mocks.auth.isStaff = true
    const wrapper = mountSection({ created_by_id: 'user-2' })

    expect(wrapper.text()).toContain('Editar')
    expect(wrapper.text()).toContain('Remover')
  })

  it('hides mutation controls from anonymous users', () => {
    mocks.auth.isLoggedIn = false
    mocks.auth.user = null
    const wrapper = mountSection({ created_by_id: 'user-2' })

    expect(wrapper.text()).not.toContain('Editar')
    expect(wrapper.text()).not.toContain('Remover')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('validates empty review updates', async () => {
    const wrapper = mountSection({ decision: null, comment: '' })

    await wrapper.get('[data-cy="review-edit"]').trigger('click')
    await wrapper.get('select').setValue('')
    await wrapper.get('textarea').setValue('')
    await wrapper.get('form').trigger('submit')

    expect(mocks.updateNested).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Preencha a decisão ou comentário da avaliação.')
  })
})
