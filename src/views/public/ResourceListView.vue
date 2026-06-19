<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import ResourceForm from '@/components/common/ResourceForm.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { canCreate } from '@/services/api/permissions'
import { findResource, type ResourceConfig } from '@/services/api/resources'
import { listResource } from '@/services/api/resources.api'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const pageLimit = 24
const offset = ref(0)
const searchTerm = ref('')
const items = ref<EntityRow[]>([])
const count = ref(0)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const isCreateOpen = ref(false)
let activeRequestId = 0

const resource = computed<ResourceConfig | undefined>(() =>
  findResource(String(route.params.resource))
)
const canCreateItem = computed(() => (resource.value ? canCreate(resource.value, auth) : false))
const filteredItems = computed(() => {
  const term = searchTerm.value.trim().toLocaleLowerCase('pt-BR')
  if (!term) {
    return items.value
  }
  return items.value.filter((item) =>
    JSON.stringify(item).toLocaleLowerCase('pt-BR').includes(term)
  )
})

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    if (!resource.value) {
      items.value = []
      count.value = 0
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const response = await listResource(resource.value.path, {
        limit: pageLimit,
        offset: offset.value
      })
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
        error instanceof Error ? error.message : 'Não foi possível carregar os dados.'
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

function handleSearchInput(term: string) {
  searchTerm.value = term
  offset.value = 0
}

async function handleCreatedRecord(created: EntityRow) {
  isCreateOpen.value = false
  const resourceKey = resource.value?.key
  if (!resourceKey || !created.id) {
    return
  }
  await router.push({
    name: 'resource-detail',
    params: { resource: resourceKey, id: String(created.id) }
  })
}
</script>

<template>
  <main class="ResourceListView">
    <header class="ResourceListView-Header">
      <h1>{{ resource?.label ?? 'Recurso não encontrado' }}</h1>
      <AppButton v-if="canCreateItem" type="button" @click="isCreateOpen = true">Novo</AppButton>
    </header>

    <label v-if="resource" class="ResourceListView-Search">
      <span>Filtrar</span>
      <input
        :value="searchTerm"
        type="search"
        placeholder="Digite para filtrar"
        @input="handleSearchInput(($event.target as HTMLInputElement).value)"
      />
    </label>

    <section v-if="isLoading" class="ResourceListView-Grid" aria-label="Carregando registros">
      <AppCard v-for="n in 3" :key="`resource-list-skeleton-${n}`">
        <div class="ResourceListView-SkeletonCard">
          <AppSkeleton width="40%" height="1.25rem" />
          <AppSkeleton width="100%" height="0.95rem" />
          <AppSkeleton width="80%" height="0.95rem" />
        </div>
      </AppCard>
    </section>
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-else-if="!resource"
      title="Recurso indisponível"
      description="Este recurso ainda não está configurado no frontend."
    />
    <EmptyState
      v-else-if="filteredItems.length === 0"
      title="Nenhum registro encontrado"
      description="Ajuste os filtros da busca ou tente novamente em instantes."
    />

    <p v-if="resource && !isLoading && !errorMessage">{{ count }} registro(s)</p>

    <section v-if="!isLoading && filteredItems.length > 0" class="ResourceListView-Grid">
      <RouterLink
        v-for="item in filteredItems"
        :key="String(item.id)"
        class="ResourceListView-Link"
        :to="{ name: 'resource-detail', params: { resource: resource?.key, id: String(item.id) } }"
      >
        <AppCard>
          <EntityCard :item="item" :title-fields="resource?.primaryFields" />
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

    <AppCard v-if="isCreateOpen && resource" class="ResourceListView-CreateCard">
      <h2>Novo registro</h2>
      <ResourceForm
        :resource="resource"
        submit-label="Criar"
        @saved="handleCreatedRecord"
        @cancel="isCreateOpen = false"
      />
    </AppCard>
  </main>
</template>

<style scoped lang="scss">
.ResourceListView {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  &-Search {
    display: grid;
    gap: var(--space-1);
    margin: var(--space-3) 0;

    span {
      font-size: var(--font-size-sm);
      color: var(--color-heading);
      font-weight: $font-weight-bold;
    }

    input {
      min-height: 36px;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: $radius-md;
      background: var(--color-background-soft);
      color: var(--color-text);
    }
  }

  &-Grid {
    display: grid;
    gap: var(--space-4);
  }

  &-SkeletonCard {
    display: grid;
    gap: var(--space-2);
  }

  &-Link {
    color: inherit;
    text-decoration: none;
  }

  &-CreateCard {
    display: grid;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
