<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { listMedia, mediaThumbnailUrl, toFallbackImage } from '@/services/api/media.api'
import type { MediaRow } from '@/types/domain/media.type'

const pageLimit = 24
const offset = ref(0)
const count = ref(0)
const items = ref<MediaRow[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
let activeRequestId = 0

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
      const response = await listMedia({ limit: pageLimit, offset: offset.value })
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      items.value = response.items
      count.value = response.count
    } catch (error) {
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível carregar mídia.'
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
  <section class="MediaListView">
    <h1>Mídia</h1>

    <StatusMessage v-if="isLoading" state="loading" message="Carregando mídia..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-else-if="items.length === 0"
      title="Nenhuma mídia encontrada"
      description="Ainda não há itens de mídia disponíveis."
    />

    <section v-if="items.length > 0" class="MediaListView-Grid">
      <RouterLink
        v-for="item in items"
        :key="String(item.id)"
        class="MediaListView-Link"
        :to="{ name: 'media-detail', params: { id: String(item.id) } }"
      >
        <AppCard>
          <article class="MediaListView-Item">
            <img
              class="MediaListView-Thumb"
              :src="mediaThumbnailUrl(item)"
              :alt="String(item.title ?? item.name ?? 'Prévia de mídia')"
              @error="toFallbackImage"
            />
            <EntityCard
              :item="item"
              :title-fields="['title', 'name', 'description', 'id']"
              :detail-fields="['status', 'type', 'original_url', 'location_id']"
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
.MediaListView {
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

  &-Thumb {
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

    &-Thumb {
      max-width: 240px;
      height: 140px;
    }
  }
}
</style>
