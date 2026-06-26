<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import FeedList from '../components/feed/FeedList.vue'

import AppCard from '@/components/common/AppCard.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import * as FeedService from '@/services/feed.service'
import type { FeedMediaItem } from '@/types/feed-media-item.type'

const feedItems: Ref<FeedMediaItem[]> = ref([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function loadFeed() {
  isLoading.value = true
  errorMessage.value = null

  try {
    feedItems.value = await FeedService.getAll()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o feed.'
  } finally {
    isLoading.value = false
  }
}

loadFeed()
</script>

<template>
  <section class="FeedView">
    <section v-if="isLoading" class="FeedView-SkeletonList" aria-label="Carregando feed">
      <AppCard v-for="n in 2" :key="`feed-skeleton-${n}`" class="FeedView-SkeletonCard">
        <AppSkeleton width="35%" height="1.25rem" />
        <AppSkeleton width="60%" height="0.9rem" />
        <AppSkeleton width="100%" height="11rem" />
      </AppCard>
    </section>
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-else-if="feedItems.length === 0"
      title="Nenhuma mídia encontrada"
      description="Ainda não há itens para exibir no feed."
    />
    <feed-list v-else :items="feedItems" />
  </section>
</template>

<style scoped lang="scss">
.FeedView {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }

  &-SkeletonList {
    display: grid;
    gap: var(--space-4);
  }

  &-SkeletonCard {
    display: grid;
    gap: var(--space-2);
  }
}
</style>
