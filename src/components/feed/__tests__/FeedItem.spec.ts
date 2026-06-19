import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FeedItem from '@/components/feed/FeedItem.vue'
import { MEDIA_FALLBACK_LOGO_URL } from '@/services/api/media.api'

describe('FeedItem', () => {
  it('falls back to logo when preview image fails', async () => {
    const wrapper = mount(FeedItem, {
      props: {
        mediaItem: {
          title: 'Mídia',
          description: 'Descrição',
          mediaUrl: '/broken-image.jpg',
          mediaAlt: 'Prévia',
          author: 'Autor',
          source: 'https://example.com',
          mediaDate: null,
          subtitle: 'Autor · data desconhecida'
        }
      },
      global: {
        stubs: {
          AppCard: { template: '<article><slot /></article>' },
          MediaBasicInfoTable: { template: '<div />' }
        }
      }
    })

    const image = wrapper.get('img')
    await image.trigger('error')
    expect((image.element as HTMLImageElement).getAttribute('src')).toBe(MEDIA_FALLBACK_LOGO_URL)
  })
})
