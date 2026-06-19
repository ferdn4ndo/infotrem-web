<script setup lang="ts">
import { RouterLink } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PathPointSummaryCard from '@/components/common/PathPointSummaryCard.vue'
import RouteSectionLocationSummaryCard from '@/components/common/RouteSectionLocationSummaryCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import type { EntityRow } from '@/types/domain/common.type'

defineProps<{
  routeId: string
  sections: EntityRow[]
}>()

function readList(row: EntityRow, key: string) {
  const value = row[key]
  return Array.isArray(value) ? (value as EntityRow[]) : []
}

function rowId(row: EntityRow) {
  const value = row.id
  return value === null || value === undefined || value === '' ? null : String(value)
}
</script>

<template>
  <section class="RouteTree">
    <EmptyState
      v-if="sections.length === 0"
      title="Sem seções cadastradas"
      description="Esta rota ainda não possui seções para exibição."
    />
    <article
      v-for="section in sections"
      :key="rowId(section) ?? JSON.stringify(section)"
      class="RouteTree-Section"
    >
      <AppCard>
        <header class="RouteTree-SectionHeader">
          <h2>{{ section.name ?? `Seção ${rowId(section) ?? '-'}` }}</h2>
          <RouterLink
            v-if="rowId(section)"
            :to="{ name: 'route-section-detail', params: { routeId, sectionId: rowId(section) } }"
            data-cy="route-tree-open-section"
          >
            Abrir seção
          </RouterLink>
        </header>
        <RoutableEntitySummaryCard :item="section" :title-fields="['name', 'status', 'id']" />
      </AppCard>

      <section class="RouteTree-Group">
        <h3>Locais</h3>
        <EmptyState
          v-if="readList(section, 'locations').length === 0"
          title="Sem locais"
          description="Nenhum local foi associado a esta seção."
        />
        <RouteSectionLocationSummaryCard
          v-for="location in readList(section, 'locations')"
          v-else
          :key="String(location.id)"
          :item="location"
          :kilometers="readList(location, 'kilometers')"
        />
      </section>

      <section class="RouteTree-Group">
        <h3>Linhas</h3>
        <EmptyState
          v-if="readList(section, 'paths').length === 0"
          title="Sem linhas"
          description="Nenhuma linha foi associada a esta seção."
        />
        <RoutableEntitySummaryCard
          v-for="path in readList(section, 'paths')"
          v-else
          :key="String(path.id)"
          :item="path"
          :title-fields="['name', 'type', 'id']"
        />
      </section>

      <section class="RouteTree-Group">
        <h3>Pontos</h3>
        <EmptyState
          v-if="readList(section, 'points').length === 0"
          title="Sem pontos"
          description="Nenhum ponto de referência foi cadastrado nesta seção."
        />
        <PathPointSummaryCard
          v-for="point in readList(section, 'points')"
          v-else
          :key="String(point.id)"
          :item="point"
        />
      </section>
    </article>
  </section>
</template>

<style scoped lang="scss">
.RouteTree {
  display: grid;
  gap: var(--space-4);

  &-Section {
    display: grid;
    gap: var(--space-3);
  }

  &-SectionHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  &-Group {
    display: grid;
    gap: var(--space-2);
  }
}
</style>
