import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ResourceDetailView from '@/views/public/ResourceDetailView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: { resource: 'information', id: 'info-1' } },
  router: { replace: vi.fn() },
  findResource: vi.fn(),
  getResource: vi.fn(),
  deleteResource: vi.fn(),
  listNested: vi.fn(),
  createNested: vi.fn(),
  createNestedComment: vi.fn(),
  createInformationVote: vi.fn(),
  createInformationEffect: vi.fn(),
  getInformationSummaryRead: vi.fn(),
  listInformationVotes: vi.fn(),
  getRouteTree: vi.fn(),
  canEdit: vi.fn(),
  canDelete: vi.fn(),
  auth: {
    isLoggedIn: true,
    isStaff: false,
    isAdmin: false,
    user: { id: 'user-1' }
  }
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => mocks.route,
    useRouter: () => mocks.router
  }
})

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mocks.auth
}))

vi.mock('@/services/api/resources', () => ({
  findResource: mocks.findResource
}))

vi.mock('@/services/api/resources.api', () => ({
  getResource: mocks.getResource,
  deleteResource: mocks.deleteResource
}))

vi.mock('@/services/api/social.api', () => ({
  listNested: mocks.listNested,
  createNested: mocks.createNested,
  createNestedComment: mocks.createNestedComment
}))

vi.mock('@/services/api/information.api', () => ({
  createInformationVote: mocks.createInformationVote,
  createInformationEffect: mocks.createInformationEffect,
  getInformationSummaryRead: mocks.getInformationSummaryRead,
  listInformationVotes: mocks.listInformationVotes
}))

vi.mock('@/services/api/summary.api', () => ({
  getRouteTree: mocks.getRouteTree
}))

vi.mock('@/services/api/permissions', () => ({
  canEdit: mocks.canEdit,
  canDelete: mocks.canDelete
}))

describe('ResourceDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findResource.mockReturnValue({
      key: 'information',
      label: 'Informações',
      path: '/information',
      primaryFields: ['title', 'description'],
      relations: []
    })
    mocks.getResource.mockResolvedValue({
      id: 'info-1',
      title: 'Informação',
      description: 'Detalhe'
    })
    mocks.listNested.mockResolvedValue({ items: [], count: 0 })
    mocks.getInformationSummaryRead
      .mockResolvedValueOnce({
        vote_summary: { up_count: 3, down_count: 1, neutral_count: 2, total_count: 6 },
        current_user_vote: { value: 1 },
        effects: []
      })
      .mockResolvedValueOnce({
        vote_summary: { up_count: 4, down_count: 1, neutral_count: 2, total_count: 7 },
        current_user_vote: { value: 1 },
        effects: []
      })
    mocks.createInformationVote.mockResolvedValue({})
    mocks.createInformationEffect.mockResolvedValue({})
    mocks.listInformationVotes.mockResolvedValue({ items: [], count: 0 })
    mocks.getRouteTree.mockResolvedValue({})
    mocks.canEdit.mockReturnValue(false)
    mocks.canDelete.mockReturnValue(false)
  })

  it('shows vote aggregates and refreshes after voting', async () => {
    const wrapper = mount(ResourceDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' },
          ResourceForm: { template: '<form />' },
          ConfirmDialog: { template: '<section />' }
        }
      }
    })
    await flushPromises()

    expect(wrapper.text()).toContain('6 voto(s): 3 concordam, 2 neutros, 1 discordam.')
    expect(wrapper.text()).toContain('Seu voto: 1')

    const voteButton = wrapper
      .findAll('button')
      .find((button) => button.text().trim() === 'Discordo')
    if (!voteButton) {
      throw new Error('Vote button not found')
    }
    await voteButton.trigger('click')
    await flushPromises()

    expect(mocks.createInformationVote).toHaveBeenCalledWith('info-1', -1)
    expect(wrapper.text()).toContain('7 voto(s): 4 concordam, 2 neutros, 1 discordam.')
  })

  it('derives current user vote from fallback vote list when summary endpoint fails', async () => {
    mocks.getInformationSummaryRead.mockReset()
    mocks.getInformationSummaryRead.mockRejectedValue(new Error('summary down'))
    mocks.listInformationVotes.mockResolvedValueOnce({
      items: [
        { id: 'vote-1', value: 1, created_by_id: 'user-2' },
        { id: 'vote-2', value: -1, created_by_id: 'user-1' }
      ],
      count: 2
    })
    mocks.listNested.mockResolvedValueOnce({ items: [], count: 0 })

    const wrapper = mount(ResourceDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RelationManager: { template: '<section />' },
          ResourceForm: { template: '<form />' },
          ConfirmDialog: { template: '<section />' }
        }
      }
    })
    await flushPromises()

    expect(mocks.listInformationVotes).toHaveBeenCalledWith('info-1')
    expect(wrapper.text()).toContain('2 voto(s): 1 concordam, 0 neutros, 1 discordam.')
    expect(wrapper.text()).toContain('Seu voto: -1')
  })
})
