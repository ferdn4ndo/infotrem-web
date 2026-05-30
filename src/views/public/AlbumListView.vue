<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import { listAlbums } from '@/services/api/albums.api'
import type { AlbumRow } from '@/types/domain/album.type'

const items = ref<AlbumRow[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function loadAlbums() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await listAlbums({ limit: 50 })
    items.value = response.items
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar álbuns.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAlbums)
</script>

<template>
  <main class="AlbumListView">
    <h1>Álbuns</h1>

    <p v-if="isLoading">Carregando álbuns...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="items.length === 0">Nenhum álbum encontrado.</p>

    <section class="AlbumListView-Grid">
      <RouterLink
        v-for="item in items"
        :key="item.id"
        class="AlbumListView-Link"
        :to="{ name: 'album-detail', params: { id: item.id } }"
      >
        <EntityCard
          :item="item"
          :title-fields="['title', 'description', 'id']"
          :detail-fields="['status', 'created_at']"
        />
      </RouterLink>
    </section>
  </main>
</template>

<style scoped lang="scss">
.AlbumListView {
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
