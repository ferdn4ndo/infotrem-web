<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import RelationManager from '@/components/common/RelationManager.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import RouteSectionLocationSummaryCard from '@/components/common/RouteSectionLocationSummaryCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { type ResourceConfig } from '@/services/api/resources'
import { useAuthStore } from '@/stores/auth.store'
import { getResource } from '@/services/api/resources.api'
import { listNested } from '@/services/api/social.api'
import { getRouteTree } from '@/services/api/summary.api'
import type { EntityRow } from '@/types/domain/common.type'

type RelationSection = {
  key: string
  label: string
  titleFields: string[]
  items: EntityRow[]
  error: string | null
}

const route = useRoute()
const auth = useAuthStore()
const item = ref<EntityRow | null>(null)
const relationSections = ref<RelationSection[]>([])
const kilometersByLocationId = ref<Record<string, EntityRow[]>>({})
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
let activeRequestId = 0

const routeId = computed(() => String(route.params.routeId ?? ''))
const sectionId = computed(() => String(route.params.sectionId ?? ''))
const parentPath = computed(() => `/routes/${routeId.value}/sections/${sectionId.value}`)
const sectionResource = computed<ResourceConfig>(() => ({
  key: 'route-section',
  label: 'Seções',
  path: `/routes/${routeId.value}/sections`,
  access: 'staff',
  primaryFields: ['name', 'status', 'id'],
  writeFields: ['name', 'status']
}))
const sectionLocationResource = computed<ResourceConfig>(() => ({
  key: 'route-section-location',
  label: 'Locais da seção',
  path: `${parentPath.value}/locations`,
  access: 'staff',
  primaryFields: ['location_id', 'location_route_order', 'id'],
  writeFields: ['location_id', 'location_route_order']
}))
const sectionLocations = computed(
  () => relationSections.value.find((section) => section.key === 'locations')?.items ?? []
)

const relationConfigs = [
  {
    key: 'locations',
    label: 'Locais da seção',
    titleFields: ['location_route_order', 'location_id', 'id']
  },
  { key: 'paths', label: 'Linhas da seção', titleFields: ['path_id', 'id'] },
  {
    key: 'points',
    label: 'Pontos de referência',
    titleFields: ['order', 'latitude', 'longitude', 'id']
  },
  { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] }
]

function stringField(row: EntityRow, field: string) {
  const value = row[field]

  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

async function loadRelation(config: (typeof relationConfigs)[number]): Promise<RelationSection> {
  try {
    const response = await listNested(parentPath.value, config.key)

    return { ...config, items: response.items, error: null }
  } catch (error) {
    return {
      ...config,
      items: [],
      error: error instanceof Error ? error.message : `Não foi possível carregar ${config.label}.`
    }
  }
}

async function loadKilometers(locations: EntityRow[]) {
  const entries = await Promise.all(
    locations.map(async (location) => {
      const locationId = stringField(location, 'id')
      if (!locationId) {
        return null
      }

      try {
        const response = await listNested(
          `${parentPath.value}/locations/${locationId}`,
          'kilometers'
        )
        return [locationId, response.items] as const
      } catch (error) {
        console.warn(
          '[RouteSectionDetailView] Failed to load location kilometers; using empty fallback.',
          error
        )
        return [locationId, []] as const
      }
    })
  )

  return Object.fromEntries(entries.filter((entry) => entry !== null))
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    if (!routeId.value || !sectionId.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = null
    kilometersByLocationId.value = {}

    try {
      const loadedItem = await getResource(`/routes/${routeId.value}/sections`, sectionId.value)
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      item.value = loadedItem
      const nestedSections = await Promise.all(relationConfigs.map(loadRelation))
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      relationSections.value = nestedSections

      try {
        const routeTree = await getRouteTree(routeId.value)
        const routeSections = (
          Array.isArray(routeTree.sections) ? routeTree.sections : []
        ) as EntityRow[]
        const targetSection = routeSections.find(
          (section) => String(section.id) === sectionId.value
        )
        if (targetSection) {
          const treeLocations = (
            Array.isArray(targetSection.locations) ? targetSection.locations : []
          ) as EntityRow[]
          const treePaths = (
            Array.isArray(targetSection.paths) ? targetSection.paths : []
          ) as EntityRow[]
          const treePoints = (
            Array.isArray(targetSection.points) ? targetSection.points : []
          ) as EntityRow[]
          relationSections.value = relationSections.value.map((section) => {
            if (section.key === 'locations' && treeLocations.length > 0) {
              return { ...section, items: treeLocations, error: null }
            }
            if (section.key === 'paths' && treePaths.length > 0) {
              return { ...section, items: treePaths, error: null }
            }
            if (section.key === 'points' && treePoints.length > 0) {
              return { ...section, items: treePoints, error: null }
            }
            return section
          })
        }
      } catch (error) {
        console.warn(
          '[RouteSectionDetailView] Failed to load /routes/:id/tree; keeping nested fallback.',
          error
        )
      }

      const locations =
        relationSections.value.find((section) => section.key === 'locations')?.items ?? []
      const kilometers = await loadKilometers(locations)
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      kilometersByLocationId.value = kilometers
    } catch (error) {
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível carregar a seção da rota.'
    } finally {
      if (!cancelled && requestId === activeRequestId) {
        isLoading.value = false
      }
    }
  })()
})
</script>

<template>
  <main class="RouteSectionDetailView">
    <RouterLink :to="{ name: 'resource-detail', params: { resource: 'routes', id: routeId } }">
      Voltar para rota
    </RouterLink>

    <h1>Seção da rota</h1>
    <StatusMessage v-if="isLoading" state="loading" message="Carregando seção..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />

    <AppCard v-if="item">
      <EntityCard :item="item" :title-fields="['name', 'status', 'id']" />
    </AppCard>

    <section
      v-for="section in relationSections"
      :key="section.key"
      class="RouteSectionDetailView-Section"
    >
      <h2>{{ section.label }}</h2>
      <StatusMessage v-if="section.error" state="error" :message="section.error" />
      <EmptyState
        v-else-if="section.items.length === 0"
        title="Nenhum registro encontrado"
        description="Não há itens relacionados nesta seção."
      />
      <template v-else>
        <article
          v-for="related in section.items"
          :key="String(related.id)"
          class="RouteSectionDetailView-Card"
        >
          <RouteSectionLocationSummaryCard
            v-if="section.key === 'locations'"
            :item="related"
            :kilometers="kilometersByLocationId[String(related.id)]"
          />
          <RoutableEntitySummaryCard v-else :item="related" :title-fields="section.titleFields" />
        </article>
      </template>
    </section>

    <section v-if="auth.isStaff" class="RouteSectionDetailView-Section">
      <h2>Gerenciar relações da seção</h2>
      <RelationManager
        :relation="{
          key: 'locations',
          label: 'Locais da seção',
          pathSuffix: 'locations',
          parentParam: 'section_id',
          access: 'staff',
          primaryFields: ['location_id', 'location_route_order', 'id'],
          writeFields: ['location_id', 'location_route_order']
        }"
        :parent-resource="sectionResource"
        :parent-id="sectionId"
      />
      <RelationManager
        :relation="{
          key: 'paths',
          label: 'Linhas da seção',
          pathSuffix: 'paths',
          parentParam: 'section_id',
          access: 'staff',
          primaryFields: ['path_id', 'id'],
          writeFields: ['path_id']
        }"
        :parent-resource="sectionResource"
        :parent-id="sectionId"
      />
      <RelationManager
        :relation="{
          key: 'information',
          label: 'Informações',
          pathSuffix: 'information',
          parentParam: 'section_id',
          access: 'public',
          primaryFields: ['title', 'content', 'status', 'id'],
          writeFields: ['information_id']
        }"
        :parent-resource="sectionResource"
        :parent-id="sectionId"
      />
      <section v-for="location in sectionLocations" :key="String(location.id)">
        <RelationManager
          :relation="{
            key: 'kilometers',
            label: `Marcos quilométricos do local ${location.location_id ?? location.id}`,
            pathSuffix: 'kilometers',
            parentParam: 'section_location_id',
            access: 'staff',
            primaryFields: ['kilometer', 'is_reference', 'id'],
            writeFields: ['kilometer', 'is_reference']
          }"
          :parent-resource="sectionLocationResource"
          :parent-id="String(location.id)"
        />
      </section>
    </section>
  </main>
</template>

<style scoped lang="scss">
.RouteSectionDetailView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-5);
  padding: var(--space-4);

  &-Section,
  &-Card,
  &-Kilometers {
    display: grid;
    gap: var(--space-3);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
