<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { listAlbumMedia, listAlbums } from '@/services/api/albums.api'
import {
  MEDIA_FALLBACK_LOGO_URL,
  mediaThumbnailUrl,
  toFallbackImage
} from '@/services/api/media.api'
import type { AlbumRow } from '@/types/domain/album.type'

const pageLimit = 24
const offset = ref(0)
const count = ref(0)
const items = ref<AlbumRow[]>([])
const coverByAlbumId = ref<Record<string, string>>({})
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
let activeRequestId = 0

function stringId(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

async function loadCovers(albums: AlbumRow[]) {
  const covers = await Promise.all(
    albums.map(async (album) => {
      const albumId = stringId(album.id)
      if (!albumId) {
        return null
      }

      try {
        const related = await listAlbumMedia(albumId, { limit: 1 })
        const cover = related.items[0]
          ? mediaThumbnailUrl(related.items[0])
          : MEDIA_FALLBACK_LOGO_URL

        return [albumId, cover] as const
      } catch (error) {
        console.warn(
          '[AlbumListView] Failed to load album cover relation; using fallback logo.',
          error
        )
        return [albumId, MEDIA_FALLBACK_LOGO_URL] as const
      }
    })
  )

  return Object.fromEntries(covers.filter((entry) => entry !== null))
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await listAlbums({ limit: pageLimit, offset: offset.value })
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      items.value = response.items
      count.value = response.count
      const coverMap = await loadCovers(response.items)
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      coverByAlbumId.value = coverMap
    } catch (error) {
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível carregar álbuns.'
    } finally {
      if (!cancelled && requestId === activeRequestId) {
        isLoading.value = false
      }
    }
  })()
})

function handleOffsetChange(nextOffset: number) {
  offset.value = nextOffset
}
</script>

<template>
  <section class="AlbumListView">
    <h1>Álbuns</h1>

    <StatusMessage v-if="isLoading" state="loading" message="Carregando álbuns..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-else-if="items.length === 0"
      title="Nenhum álbum encontrado"
      description="Ainda não há álbuns para exibir."
    />

    <section v-if="items.length > 0" class="AlbumListView-Grid">
      <RouterLink
        v-for="item in items"
        :key="item.id"
        class="AlbumListView-Link"
        :to="{ name: 'album-detail', params: { id: item.id } }"
      >
        <AppCard>
          <article class="AlbumListView-Item">
            <img
              class="AlbumListView-Cover"
              :src="coverByAlbumId[String(item.id)] ?? MEDIA_FALLBACK_LOGO_URL"
              :alt="`Capa do álbum ${String(item.title ?? item.id)}`"
              @error="toFallbackImage"
            />
            <EntityCard
              :item="item"
              :title-fields="['title', 'description', 'id']"
              :detail-fields="['status', 'created_at']"
            />
          </article>
        </AppCard>
      </RouterLink>
    </section>

    <AppPagination
      v-if="count > pageLimit"
      :limit="pageLimit"
      :offset="offset"
      :count="count"
      @update:offset="handleOffsetChange"
    />
  </section>
</template>

<style scoped lang="scss">
.AlbumListView {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Grid {
    display: grid;
    gap: var(--space-4);
  }

  &-Link {
    color: inherit;
    text-decoration: none;
  }

  &-Item {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: minmax(96px, 180px) 1fr;
    align-items: start;
  }

  &-Cover {
    width: 100%;
    height: 112px;
    object-fit: cover;
    border-radius: $radius-md;
    border: 1px solid var(--color-border);
    background: var(--color-background-mute);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);

    &-Item {
      grid-template-columns: 1fr;
    }

    &-Cover {
      max-width: 240px;
      height: 140px;
    }
  }
}
</style>
