<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import { resourceForEntityType } from '@/services/api/resources'
import * as SearchApi from '@/services/api/search.api'

const route = useRoute()
const router = useRouter()
const query = ref(String(route.query.q ?? ''))
const items = ref<SearchApi.SearchResultItem[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const trimmedQuery = computed(() => query.value.trim())

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

function routeFor(item: SearchApi.SearchResultItem) {
  const resource = resourceForEntityType(String(item.entity_type))

  if (!resource || !item.id) {
    return null
  }

  return { name: 'resource-detail', params: { resource: resource.key, id: String(item.id) } }
}
</script>

<template>
  <main class="SearchView">
    <h1>Busca</h1>

    <form class="SearchView-Form" @submit.prevent="submitSearch">
      <input
        v-model="query"
        class="SearchView-Input"
        placeholder="Busque por locais, material rodante, mídia..."
      />
      <button class="SearchView-Button" type="submit">Buscar</button>
    </form>

    <p v-if="isLoading">Buscando...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="route.query.q && items.length === 0">Nenhum resultado encontrado.</p>

    <section class="SearchView-Results">
      <component
        :is="routeFor(item) ? RouterLink : 'div'"
        v-for="item in items"
        :key="`${item.entity_type}-${item.id}`"
        class="SearchView-Result"
        :to="routeFor(item) ?? undefined"
      >
        <EntityCard :item="item" :title-fields="['title', 'name', 'code', 'number', 'id']" />
      </component>
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
    gap: 16px;
  }

  &-Result {
    color: inherit;
    text-decoration: none;
  }
}
</style>
