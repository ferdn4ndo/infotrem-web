<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import { routeForEntityRow } from '@/services/api/entity-routing'
import * as SearchApi from '@/services/api/search.api'

const route = useRoute()
const router = useRouter()
const query = ref(String(route.query.q ?? ''))
const items = ref<SearchApi.SearchResultItem[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const trimmedQuery = computed(() => query.value.trim())
const groupedItems = computed(() => {
  const groups = new Map<string, SearchApi.SearchResultItem[]>()

  for (const item of items.value) {
    const label = labelFor(item)
    groups.set(label, [...(groups.get(label) ?? []), item])
  }

  return Array.from(groups, ([label, groupItems]) => ({ label, items: groupItems }))
})

watchEffect(async () => {
  const q = String(route.query.q ?? '').trim()
  query.value = q

  if (!q) {
    items.value = []
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await SearchApi.search(q)
    items.value = response.items
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível buscar.'
  } finally {
    isLoading.value = false
  }
})

function submitSearch() {
  router.push({ name: 'search', query: { q: trimmedQuery.value } })
}

function labelFor(item: SearchApi.SearchResultItem) {
  return routeForEntityRow(item).label
}
</script>

<template>
  <main class="SearchView">
    <h1>Busca</h1>

    <form class="SearchView-Form" data-cy="search-form" @submit.prevent="submitSearch">
      <input
        v-model="query"
        class="SearchView-Input"
        data-cy="search-input"
        placeholder="Busque por locais, material rodante, mídia..."
      />
      <button class="SearchView-Button" data-cy="search-submit" type="submit">Buscar</button>
    </form>

    <p v-if="isLoading">Buscando...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="route.query.q && items.length === 0">Nenhum resultado encontrado.</p>

    <section class="SearchView-Results">
      <section v-for="group in groupedItems" :key="group.label" class="SearchView-Group">
        <h2>{{ group.label }}</h2>
        <RoutableEntitySummaryCard
          v-for="item in group.items"
          :key="`${item.entity_type}-${item.id}`"
          class="SearchView-Result"
          data-cy="search-result"
          :item="item"
          :title-fields="['title', 'name', 'code', 'number', 'id']"
        />
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
.SearchView {
  padding: 24px;

  &-Form {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }

  &-Input {
    flex: 1 1 auto;
    padding: 10px;
  }

  &-Button {
    padding: 10px 16px;
  }

  &-Results {
    display: grid;
    gap: 24px;
  }

  &-Group {
    display: grid;
    gap: 12px;
  }

  &-Result {
    display: grid;
    gap: 8px;
    color: inherit;
    text-decoration: none;
  }

  &-Type,
  &-Reason {
    display: block;
  }
}
</style>
