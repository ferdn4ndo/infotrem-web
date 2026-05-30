<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import RouteSectionLocationSummaryCard from '@/components/common/RouteSectionLocationSummaryCard.vue'
import { getResource } from '@/services/api/resources.api'
import { listNested } from '@/services/api/social.api'
import type { EntityRow } from '@/types/domain/common.type'

type RelationSection = {
  key: string
  label: string
  titleFields: string[]
  items: EntityRow[]
  error: string | null
}

const route = useRoute()
const item = ref<EntityRow | null>(null)
const relationSections = ref<RelationSection[]>([])
const kilometersByLocationId = ref<Record<string, EntityRow[]>>({})
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const routeId = computed(() => String(route.params.routeId ?? ''))
const sectionId = computed(() => String(route.params.sectionId ?? ''))
const parentPath = computed(() => `/routes/${routeId.value}/sections/${sectionId.value}`)

const relationConfigs = [
  {
    key: 'locations',
    label: 'Locais da seção',
    titleFields: ['location_route_order', 'location_id', 'id']
  },
  { key: 'paths', label: 'Linhas da seção', titleFields: ['path_id', 'id'] },
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
      } catch {
        return [locationId, []] as const
      }
    })
  )

  kilometersByLocationId.value = Object.fromEntries(entries.filter((entry) => entry !== null))
}

watchEffect(async () => {
  if (!routeId.value || !sectionId.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = null
  kilometersByLocationId.value = {}

  try {
    item.value = await getResource(`/routes/${routeId.value}/sections`, sectionId.value)
    relationSections.value = await Promise.all(relationConfigs.map(loadRelation))
    const locations =
      relationSections.value.find((section) => section.key === 'locations')?.items ?? []
    await loadKilometers(locations)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar a seção da rota.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main class="RouteSectionDetailView">
    <RouterLink :to="{ name: 'resource-detail', params: { resource: 'routes', id: routeId } }">
      Voltar para rota
    </RouterLink>

    <h1>Seção da rota</h1>
    <p v-if="isLoading">Carregando seção...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <EntityCard v-if="item" :item="item" :title-fields="['name', 'status', 'id']" />

    <section
      v-for="section in relationSections"
      :key="section.key"
      class="RouteSectionDetailView-Section"
    >
      <h2>{{ section.label }}</h2>
      <p v-if="section.error">{{ section.error }}</p>
      <p v-else-if="section.items.length === 0">Nenhum registro encontrado.</p>
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
  </main>
</template>

<style scoped lang="scss">
.RouteSectionDetailView {
  display: grid;
  gap: 20px;
  padding: 24px;

  &-Section,
  &-Card,
  &-Kilometers {
    display: grid;
    gap: 12px;
  }
}
</style>
