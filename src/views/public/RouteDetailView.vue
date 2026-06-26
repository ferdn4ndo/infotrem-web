<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import RelationManager from '@/components/common/RelationManager.vue'
import RouteTree from '@/components/common/RouteTree.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { findResource } from '@/services/api/resources'
import { getResource } from '@/services/api/resources.api'
import { listNested } from '@/services/api/social.api'
import { getRouteTree } from '@/services/api/summary.api'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()

const routeItem = ref<EntityRow | null>(null)
const routeSections = ref<EntityRow[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
let activeRequestId = 0

const routeId = computed(() => String(route.params.id ?? ''))
const routeResource = computed(() => findResource('routes'))

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    if (!routeId.value) {
      return
    }
    isLoading.value = true
    errorMessage.value = null

    try {
      const tree = await getRouteTree(routeId.value)
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      routeItem.value = (tree.route as EntityRow | undefined) ?? tree
      routeSections.value = Array.isArray(tree.sections) ? (tree.sections as EntityRow[]) : []
    } catch (error) {
      console.warn(
        '[RouteDetailView] Falha ao carregar /routes/:id/tree; usando fallback por recursos base.',
        error
      )
      try {
        const [routeRecord, sections] = await Promise.all([
          getResource('/routes', routeId.value),
          listNested(`/routes/${routeId.value}`, 'sections')
        ])
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        routeItem.value = routeRecord
        routeSections.value = sections.items
      } catch (fallbackError) {
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        errorMessage.value =
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Não foi possível carregar a árvore da rota.'
      }
    } finally {
      if (!cancelled && requestId === activeRequestId) {
        isLoading.value = false
      }
    }
  })()
})
</script>

<template>
  <section class="RouteDetailView">
    <RouterLink to="/routes">Voltar para rotas</RouterLink>

    <h1>{{ routeItem?.name ?? 'Rota' }}</h1>
    <StatusMessage v-if="isLoading" state="loading" message="Carregando rota..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-else-if="!routeItem"
      title="Rota não encontrada"
      description="Não foi possível carregar os dados da rota solicitada."
    />

    <AppCard v-if="routeItem">
      <p><strong>Rota:</strong> {{ routeItem.name ?? routeItem.id }}</p>
      <p><strong>Status:</strong> {{ routeItem.status ?? 'Não informado' }}</p>
    </AppCard>

    <section class="RouteDetailView-Section">
      <h2>Árvore da rota</h2>
      <RouteTree :route-id="routeId" :sections="routeSections" />
    </section>

    <template v-if="routeResource">
      <RelationManager
        v-for="relation in routeResource.relations ?? []"
        :key="relation.key"
        :relation="relation"
        :parent-resource="routeResource"
        :parent-id="routeId"
      />
    </template>
  </section>
</template>

<style scoped lang="scss">
.RouteDetailView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-4);
  padding: var(--space-4);

  &-Section {
    display: grid;
    gap: var(--space-3);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
