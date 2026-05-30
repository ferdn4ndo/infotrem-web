<script setup lang="ts">
import { computed, ref } from 'vue'

import EntityCard from '@/components/common/EntityCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import { routeForEntityRow } from '@/services/api/entity-routing'
import * as MapApi from '@/services/api/map.api'
import { normalizeMapItems, type NormalizedMapItem } from '@/services/api/map-normalization'

const lat = ref(-23.55)
const lng = ref(-46.63)
const zoom = ref(8)
const items = ref<NormalizedMapItem[]>([])
const bounds = ref<MapApi.MapResult['bounds'] | null>(null)
const query = ref<MapApi.MapResult['query'] | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const mappedItemCount = computed(() => items.value.filter((item) => item.coordinates).length)

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
    items.value = normalizeMapItems(response.items)
    bounds.value = response.bounds
    query.value = response.query
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o mapa.'
  } finally {
    isLoading.value = false
  }
}

function labelFor(item: NormalizedMapItem) {
  return routeForEntityRow(item).label
}

loadMapData()
</script>

<template>
  <main class="MapView">
    <h1>Mapa</h1>

    <form class="MapView-Form" data-cy="map-form" @submit.prevent="loadMapData">
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
      <button type="submit" data-cy="map-submit">Atualizar</button>
    </form>

    <p v-if="isLoading">Carregando mapa...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <EntityCard v-if="bounds" class="MapView-Bounds" :item="bounds" :title-fields="['bounds']" />
    <EntityCard v-if="query" class="MapView-Bounds" :item="query" :title-fields="['query']" />

    <p v-if="items.length > 0" class="MapView-Summary">
      {{ mappedItemCount }} de {{ items.length }} resultados têm coordenadas normalizadas.
    </p>

    <section class="MapView-Results">
      <RoutableEntitySummaryCard
        v-for="(item, index) in items"
        :key="`${item.entity_type}-${item.id ?? index}`"
        class="MapView-Result"
        data-cy="map-result"
        :item="item"
        :title-fields="['title', 'name', 'code', 'entity_type', 'id']"
      >
        <strong>{{ labelFor(item) }}</strong>
        <p v-if="item.coordinates" class="MapView-Coordinates">
          {{ item.coordinates.lat }}, {{ item.coordinates.lng }}
        </p>
        <p v-else class="MapView-Coordinates">Coordenadas indisponíveis</p>
      </RoutableEntitySummaryCard>
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

  &-Summary {
    margin: 0 0 16px;
  }

  &-Results {
    display: grid;
    gap: 16px;
  }

  &-Result {
    color: inherit;
    text-decoration: none;
  }

  &-Coordinates {
    margin-bottom: 8px;
  }
}
</style>
