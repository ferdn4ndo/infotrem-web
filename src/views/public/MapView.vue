<script setup lang="ts">
import { ref } from 'vue'

import EntityCard from '@/components/common/EntityCard.vue'
import * as MapApi from '@/services/api/map.api'

const lat = ref(-23.55)
const lng = ref(-46.63)
const zoom = ref(8)
const items = ref<MapApi.MapResult['items']>([])
const bounds = ref<MapApi.MapResult['bounds'] | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function loadMapData() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await MapApi.getMapData({
      lat: lat.value,
      lng: lng.value,
      zoom: zoom.value,
      width: 1280,
      height: 720
    })
    items.value = response.items
    bounds.value = response.bounds
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o mapa.'
  } finally {
    isLoading.value = false
  }
}

loadMapData()
</script>

<template>
  <main class="MapView">
    <h1>Mapa</h1>

    <form class="MapView-Form" @submit.prevent="loadMapData">
      <label>
        Latitude
        <input v-model.number="lat" type="number" step="0.000001" />
      </label>
      <label>
        Longitude
        <input v-model.number="lng" type="number" step="0.000001" />
      </label>
      <label>
        Zoom
        <input v-model.number="zoom" type="number" min="1" max="20" />
      </label>
      <button type="submit">Atualizar</button>
    </form>

    <p v-if="isLoading">Carregando mapa...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <EntityCard v-if="bounds" class="MapView-Bounds" :item="bounds" :title-fields="['bounds']" />

    <section class="MapView-Results">
      <EntityCard
        v-for="(item, index) in items"
        :key="`${item.entity_type}-${item.id ?? index}`"
        :item="item"
        :title-fields="['title', 'name', 'code', 'entity_type', 'id']"
      />
    </section>
  </main>
</template>

<style scoped lang="scss">
.MapView {
  padding: 24px;

  &-Form {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
  }

  &-Bounds {
    margin-bottom: 16px;
  }

  &-Results {
    display: grid;
    gap: 16px;
  }
}
</style>
