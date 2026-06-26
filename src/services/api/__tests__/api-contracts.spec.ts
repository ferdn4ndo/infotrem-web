import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as AuthApi from '@/services/api/auth.api'
import * as MapApi from '@/services/api/map.api'
import * as MediaApi from '@/services/api/media.api'
import * as AlbumsApi from '@/services/api/albums.api'
import { reviewDecisionLabel, reviewDecisions } from '@/services/api/review-decisions'
import * as ResourcesApi from '@/services/api/resources.api'
import * as SearchApi from '@/services/api/search.api'
import * as SummaryApi from '@/services/api/summary.api'
import { apiClient } from '@/services/http/api-client'

vi.mock('@/services/http/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('frontend API contract helpers', () => {
  it('loads /me and sends login credentials to stable auth paths', () => {
    AuthApi.login({ email: 'user@example.test', password: 'secret' })
    AuthApi.me()

    expect(apiClient.post).toHaveBeenCalledWith('/login', {
      email: 'user@example.test',
      password: 'secret'
    })
    expect(apiClient.get).toHaveBeenCalledWith('/me')
  })

  it('uses default-storage and explicit FileMgr media paths', () => {
    MediaApi.uploadMediaFromUrl('media-1', { url: 'https://example.test/image.jpg' })
    MediaApi.createMediaDownload('media-1', 'storage-1', 'file-1')
    MediaApi.getMediaDetail('media-1')
    AlbumsApi.getAlbumDetail('album-1')

    expect(apiClient.post).toHaveBeenCalledWith('/media/media-1/upload-from-url', {
      url: 'https://example.test/image.jpg'
    })
    expect(apiClient.post).toHaveBeenCalledWith(
      '/media/media-1/storages/storage-1/files/file-1/download'
    )
    expect(apiClient.get).toHaveBeenCalledWith('/media/media-1/detail')
    expect(apiClient.get).toHaveBeenCalledWith('/albums/album-1/detail')
  })

  it('keeps generic list responses on resource paths with pagination params', () => {
    ResourcesApi.listResource('/companies', { limit: 10, offset: 20 })

    expect(apiClient.get).toHaveBeenCalledWith('/companies', {
      query: { limit: 10, offset: 20 }
    })
  })

  it('sends stable search and map query parameters', () => {
    SearchApi.search('locomotiva', 15)
    MapApi.getMapData({ lat: -23.55, lng: -46.63, zoom: 8, width: 1280, height: 720 })

    expect(apiClient.get).toHaveBeenCalledWith('/search', { query: { q: 'locomotiva', limit: 15 } })
    expect(apiClient.get).toHaveBeenCalledWith('/map', {
      query: { lat: -23.55, lng: -46.63, zoom: 8, width: 1280, height: 720 }
    })
  })

  it('requests company summary using the aggregate endpoint contract', () => {
    SummaryApi.getCompanySummary('company-1')

    expect(apiClient.get).toHaveBeenCalledWith('/companies/company-1/summary')
  })

  it('exposes the controlled review decision vocabulary used by review forms', () => {
    expect(reviewDecisions.map((decision) => decision.value)).toEqual([
      'approve',
      'reject',
      'needs_changes'
    ])
    expect(reviewDecisionLabel('needs_changes')).toBe('Precisa de ajustes')
  })
})
