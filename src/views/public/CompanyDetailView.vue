<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import RelationManager from '@/components/common/RelationManager.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { findResource } from '@/services/api/resources'
import { getResource } from '@/services/api/resources.api'
import { listNested } from '@/services/api/social.api'
import { getCompanySummary } from '@/services/api/summary.api'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()

const company = ref<EntityRow | null>(null)
const paintSchemes = ref<EntityRow[]>([])
const summaryCounts = ref<Record<string, unknown>>({})
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
let activeRequestId = 0

const companyId = computed(() => String(route.params.id ?? ''))
const companyResource = computed(() => findResource('companies'))
const paintSchemesResource = computed(() => findResource('paint-schemes'))

function readCount(key: string, fallback: number) {
  const raw = summaryCounts.value[key]
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    if (!companyId.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const summary = await getCompanySummary(companyId.value)
      if (cancelled || requestId !== activeRequestId) {
        return
      }

      company.value = (summary.company as EntityRow | undefined) ?? null
      paintSchemes.value = Array.isArray(summary.paint_schemes)
        ? (summary.paint_schemes as EntityRow[])
        : []
      summaryCounts.value =
        summary.counts && typeof summary.counts === 'object'
          ? (summary.counts as Record<string, unknown>)
          : {}
    } catch (error) {
      console.warn(
        '[CompanyDetailView] Falha ao carregar /companies/:id/summary; usando fallback por recursos base.',
        error
      )
      try {
        const [loadedCompany, loadedInformation, loadedPaintSchemes] = await Promise.all([
          getResource('/companies', companyId.value),
          listNested(`/companies/${companyId.value}`, 'information'),
          listNested(`/companies/${companyId.value}`, 'paint-schemes')
        ])
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        company.value = loadedCompany
        paintSchemes.value = loadedPaintSchemes.items
        summaryCounts.value = {
          information_count: loadedInformation.count,
          paint_schemes_count: loadedPaintSchemes.count
        }
      } catch (fallbackError) {
        if (cancelled || requestId !== activeRequestId) {
          return
        }
        errorMessage.value =
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Não foi possível carregar os detalhes da empresa.'
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
  <main class="CompanyDetailView">
    <RouterLink to="/companies">Voltar para empresas</RouterLink>

    <h1>{{ company?.name ?? 'Empresa' }}</h1>
    <p v-if="company?.abbrev" class="CompanyDetailView-Abbrev">{{ company.abbrev }}</p>

    <StatusMessage v-if="isLoading" state="loading" message="Carregando empresa..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />

    <AppCard v-if="company">
      <EntityCard
        :item="company"
        :title-fields="['name', 'abbrev', 'id']"
        :detail-fields="['status', 'created_at', 'updated_at']"
      />
    </AppCard>

    <section class="CompanyDetailView-Counts">
      <AppCard>
        <strong>Informações</strong>
        <p>{{ readCount('information_count', 0) }}</p>
      </AppCard>
      <AppCard>
        <strong>Pinturas</strong>
        <p>{{ readCount('paint_schemes_count', paintSchemes.length) }}</p>
      </AppCard>
    </section>

    <section class="CompanyDetailView-Section">
      <h2>Pinturas com informações</h2>
      <article
        v-for="paintScheme in paintSchemes"
        :key="String(paintScheme.id)"
        class="CompanyDetailView-PaintScheme"
      >
        <AppCard>
          <EntityCard :item="paintScheme" :title-fields="['name', 'status', 'id']" />
        </AppCard>
        <RelationManager
          v-if="paintSchemesResource && paintScheme.id"
          :relation="{
            key: 'information',
            label: 'Informações da pintura',
            pathSuffix: 'information',
            parentParam: 'paint_scheme_id',
            access: 'public',
            primaryFields: ['title', 'content', 'status', 'id'],
            writeFields: ['information_id']
          }"
          :parent-resource="paintSchemesResource"
          :parent-id="String(paintScheme.id)"
          :parent-path-override="`/companies/${companyId}/paint-schemes/${String(paintScheme.id)}`"
        />
      </article>
    </section>

    <template v-if="companyResource">
      <RelationManager
        v-for="relation in (companyResource.relations ?? []).filter(
          (entry) => entry.key !== 'paint-schemes'
        )"
        :key="relation.key"
        :relation="relation"
        :parent-resource="companyResource"
        :parent-id="companyId"
      />
    </template>
  </main>
</template>

<style scoped lang="scss">
.CompanyDetailView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-4);
  padding: var(--space-4);

  &-Abbrev {
    margin: calc(var(--space-3) * -1) 0 0;
    color: var(--color-text-secondary);
  }

  &-Counts {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));

    p {
      margin: var(--space-2) 0 0;
      font-size: var(--font-size-xl);
    }
  }

  &-Section,
  &-PaintScheme,
  &-NestedInformation {
    display: grid;
    gap: var(--space-3);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
