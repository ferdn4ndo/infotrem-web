<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import { listMedia } from '@/services/api/media.api'
import type { MediaRow } from '@/types/domain/media.type'

const items = ref<MediaRow[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function loadMedia() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await listMedia({ limit: 50 })
    items.value = response.items
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar mídia.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMedia)
</script>

<template>
  <main class="MediaListView">
    <h1>Mídia</h1>

    <p v-if="isLoading">Carregando mídia...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="items.length === 0">Nenhuma mídia encontrada.</p>

    <section class="MediaListView-Grid">
      <RouterLink
        v-for="item in items"
        :key="String(item.id)"
        class="MediaListView-Link"
        :to="{ name: 'media-detail', params: { id: String(item.id) } }"
      >
        <EntityCard
          :item="item"
          :title-fields="['title', 'name', 'description', 'id']"
          :detail-fields="['status', 'type', 'original_url', 'location_id']"
        />
      </RouterLink>
    </section>
  </main>
</template>

<style scoped lang="scss">
.MediaListView {
  padding: 24px;

  &-Grid {
    display: grid;
    gap: 16px;
  }

  &-Link {
    color: inherit;
    text-decoration: none;
  }
}
</style>
