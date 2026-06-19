<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { findResource, type ResourceConfig } from '@/services/api/resources'
import { listResource } from '@/services/api/resources.api'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()
const pageLimit = 24
const offset = ref(0)
const items = ref<EntityRow[]>([])
const count = ref(0)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
let activeRequestId = 0

const resource = computed<ResourceConfig | undefined>(() =>
  findResource(String(route.params.resource))
)

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
</script>

<template>
  <main class="ResourceListView">
    <h1>{{ resource?.label ?? 'Recurso não encontrado' }}</h1>

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
      v-else-if="items.length === 0"
      title="Nenhum registro encontrado"
      description="Ajuste os filtros da busca ou tente novamente em instantes."
    />

    <p v-if="resource && !isLoading && !errorMessage">{{ count }} registro(s)</p>

    <section v-if="!isLoading && items.length > 0" class="ResourceListView-Grid">
      <RouterLink
        v-for="item in items"
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
  </main>
</template>

<style scoped lang="scss">
.ResourceListView {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);

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

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
