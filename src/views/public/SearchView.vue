<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { routeForEntityRow } from '@/services/api/entity-routing'
import * as SearchApi from '@/services/api/search.api'

const route = useRoute()
const router = useRouter()
const query = ref(String(route.query.q ?? ''))
const items = ref<SearchApi.SearchResultItem[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
let activeRequestId = 0

const trimmedQuery = computed(() => query.value.trim())
const groupedItems = computed(() => {
  const groups = new Map<string, SearchApi.SearchResultItem[]>()

  for (const item of items.value) {
    const label = labelFor(item)
    groups.set(label, [...(groups.get(label) ?? []), item])
  }

  return Array.from(groups, ([label, groupItems]) => ({ label, items: groupItems }))
})

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
    if (requestId === activeRequestId) {
      isLoading.value = false
    }
  })

  void (async () => {
    const q = String(route.query.q ?? '').trim()
    query.value = q

    if (!q) {
      items.value = []
      errorMessage.value = null
      isLoading.value = false
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await SearchApi.search(q)
      if (cancelled || requestId !== activeRequestId) {
        if (requestId === activeRequestId) {
          isLoading.value = false
        }
        return
      }
      items.value = response.items
    } catch (error) {
      if (cancelled || requestId !== activeRequestId) {
        if (requestId === activeRequestId) {
          isLoading.value = false
        }
        return
      }
      errorMessage.value = error instanceof Error ? error.message : 'Não foi possível buscar.'
    } finally {
      if (requestId === activeRequestId) {
        isLoading.value = false
      }
    }
  })()
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
      <AppButton class="SearchView-Button" data-cy="search-submit" type="submit">Buscar</AppButton>
    </form>

    <StatusMessage v-if="isLoading" state="loading" message="Buscando..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-else-if="route.query.q && items.length === 0"
      title="Nenhum resultado encontrado"
      description="Tente ajustar os termos da busca."
    />

    <section v-if="groupedItems.length > 0" class="SearchView-Results">
      <section v-for="group in groupedItems" :key="group.label" class="SearchView-Group">
        <h2>{{ group.label }}</h2>
        <AppCard
          v-for="item in group.items"
          :key="`${item.entity_type}-${item.id}`"
          class="SearchView-Result"
          data-cy="search-result"
        >
          <RoutableEntitySummaryCard
            :item="item"
            :title-fields="['title', 'name', 'code', 'number', 'id']"
          />
        </AppCard>
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
.SearchView {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Form {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-5);
  }

  &-Input {
    flex: 1 1 auto;
    padding: var(--space-2) var(--space-3);
  }

  &-Button {
    min-width: 120px;
  }

  &-Results {
    display: grid;
    gap: var(--space-5);
  }

  &-Group {
    display: grid;
    gap: var(--space-3);
  }

  &-Result {
    display: grid;
    gap: var(--space-2);
    color: inherit;
    text-decoration: none;
  }

  &-Type,
  &-Reason {
    display: block;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);

    &-Form {
      flex-direction: column;
    }
  }
}
</style>
