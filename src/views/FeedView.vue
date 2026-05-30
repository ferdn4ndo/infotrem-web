<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import FeedList from '../components/feed/FeedList.vue'

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
  <main>
    <p v-if="isLoading">Carregando feed...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="feedItems.length === 0">Nenhuma mídia encontrada.</p>
    <feed-list v-else :items="feedItems" />
  </main>
</template>
