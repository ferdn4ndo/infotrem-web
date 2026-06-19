<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import CommentSection from '@/components/common/CommentSection.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import * as InformationApi from '@/services/api/information.api'
import { findResource } from '@/services/api/resources'
import { getResource } from '@/services/api/resources.api'
import * as SocialApi from '@/services/api/social.api'
import { ApiError } from '@/services/http/api-error'
import { getRouteTree } from '@/services/api/summary.api'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'

type RelationSectionConfig = {
  key: string
  label: string
  titleFields: string[]
  fallbackKeys?: string[]
}

type RelationSection = RelationSectionConfig & {
  items: EntityRow[]
  error: string | null
}

type SummaryVariant = 'auto' | 'path-point' | 'rolling-stock'

type InformationVoteSummary = {
  total: number
  up: number
  neutral: number
  down: number
  currentUserVote: -1 | 0 | 1 | null
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const item = ref<EntityRow | null>(null)
const relatedItems = ref<EntityRow[]>([])
const relationSections = ref<RelationSection[]>([])
const informationVoteSummary = ref<InformationVoteSummary>({
  total: 0,
  up: 0,
  neutral: 0,
  down: 0,
  currentUserVote: null
})
const commentText = ref('')
const effectFieldName = ref('')
const effectOldValue = ref('')
const effectNewValue = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)
let activeRequestId = 0

function isStaleRequest(requestId: number) {
  return requestId !== activeRequestId
}

const resource = computed(() => findResource(String(route.params.resource)))
const currentId = computed(() => String(route.params.id ?? ''))
const parentPath = computed(() =>
  resource.value && route.params.id ? `${resource.value.path}/${String(route.params.id)}` : null
)
const supportsComments = computed(() => ['media', 'albums'].includes(String(resource.value?.key)))
const supportsReactions = computed(() =>
  ['media', 'albums', 'comments'].includes(String(resource.value?.key))
)
const supportsInformationContributions = computed(() => resource.value?.key === 'information')
const relationConfigs = computed(
  () => resourceRelationConfigs[String(resource.value?.key ?? '')] ?? []
)

const resourceRelationConfigs: Record<string, RelationSectionConfig[]> = {
  companies: [
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] },
    { key: 'paint-schemes', label: 'Pinturas', titleFields: ['name', 'status', 'id'] }
  ],
  manufacturers: [
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] }
  ],
  locations: [
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] },
    { key: 'paths', label: 'Linhas', titleFields: ['name', 'code', 'path_id', 'id'] },
    { key: 'track-gauges', label: 'Bitolas', titleFields: ['name', 'code', 'gauge_id', 'id'] }
  ],
  paths: [
    { key: 'locations', label: 'Locais', titleFields: ['name', 'code', 'location_id', 'id'] },
    {
      key: 'points',
      label: 'Pontos da linha',
      titleFields: ['order', 'latitude', 'longitude', 'id']
    }
  ],
  routes: [
    { key: 'sections', label: 'Seções', titleFields: ['name', 'status', 'id'] },
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] }
  ],
  'rolling-stock': [
    { key: 'media', label: 'Mídia', titleFields: ['title', 'description', 'media_id', 'id'] },
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] },
    {
      key: 'locomotives',
      label: 'Locomotivas',
      titleFields: ['id', 'rolling_stock_id', 'design_id']
    },
    {
      key: 'freight-cars',
      label: 'Vagões de carga',
      titleFields: ['number', 'prefix', 'freight_car_type_id', 'id'],
      fallbackKeys: ['freight-car']
    },
    {
      key: 'passenger-cars',
      label: 'Carros de passageiros',
      titleFields: ['number', 'prefix', 'passenger_car_type_id', 'id'],
      fallbackKeys: ['passenger-car']
    },
    {
      key: 'non-revenue-cars',
      label: 'Veículos de serviço',
      titleFields: ['number', 'prefix', 'non_revenue_car_type_id', 'id'],
      fallbackKeys: ['non-revenue-car']
    },
    {
      key: 'sigo-regionals',
      label: 'Regionais SIGO',
      titleFields: ['name', 'abbrev', 'letter', 'id']
    }
  ],
  'paint-schemes': [
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] }
  ],
  states: [{ key: 'cities', label: 'Cidades', titleFields: ['name', 'ibge_id', 'id'] }],
  'track-gauges': [
    { key: 'locations', label: 'Locais', titleFields: ['name', 'code', 'location_id', 'id'] }
  ],
  'locomotive-designs': [
    { key: 'gauges', label: 'Bitolas', titleFields: ['code', 'size', 'gauge_id', 'id'] }
  ],
  information: [
    {
      key: 'effects',
      label: 'Propostas de alteração',
      titleFields: ['field_name', 'old_value', 'new_value', 'id']
    }
  ]
}

function toNumber(value: unknown) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function toVoteValue(value: unknown): -1 | 0 | 1 | null {
  const numeric = Number(value)
  if (numeric === -1 || numeric === 0 || numeric === 1) {
    return numeric
  }

  return null
}

function userIdForVoteRow(row: EntityRow) {
  return (row.user_id ?? row.created_by_id ?? row.account_id ?? row.owner_id)?.toString() ?? null
}

function deriveCurrentUserVoteFromVotes(votes: EntityRow[]) {
  const currentUserId = auth.user?.id?.toString()
  if (!currentUserId) {
    return null
  }

  for (const row of votes) {
    if (userIdForVoteRow(row) !== currentUserId) {
      continue
    }
    const vote = toVoteValue(row.value)
    if (vote !== null) {
      return vote
    }
  }

  return null
}

function isInapplicableRelationError(error: unknown) {
  return error instanceof ApiError && error.status === 404
}

function parseVoteSummary(summaryRow: EntityRow | null | undefined, votes: EntityRow[] = []) {
  const up = toNumber(summaryRow?.up_count ?? summaryRow?.positive_count)
  const down = toNumber(summaryRow?.down_count ?? summaryRow?.negative_count)
  const neutral = toNumber(summaryRow?.neutral_count)
  const totalFromSummary = toNumber(
    summaryRow?.count ?? summaryRow?.total_count ?? summaryRow?.votes_count
  )
  const total = totalFromSummary || up + down + neutral || votes.length
  const currentVoteRow =
    (summaryRow?.current_user_vote as EntityRow | undefined) ??
    (summaryRow?.current_vote as EntityRow | undefined)
  const currentVote = toVoteValue(
    currentVoteRow?.value ?? summaryRow?.current_user_vote_value ?? summaryRow?.current_vote_value
  )

  return {
    up,
    down,
    neutral,
    total,
    currentUserVote: currentVote
  } satisfies InformationVoteSummary
}

async function loadInformationVoteSummary(requestId: number) {
  if (!supportsInformationContributions.value || !currentId.value) {
    if (isStaleRequest(requestId)) {
      return
    }
    informationVoteSummary.value = {
      total: 0,
      up: 0,
      neutral: 0,
      down: 0,
      currentUserVote: null
    }
    return
  }

  try {
    const summary = await InformationApi.getInformationSummaryRead(currentId.value)
    if (isStaleRequest(requestId)) {
      return
    }
    const effects = Array.isArray(summary.effects) ? summary.effects : []
    const voteSummaryRow =
      (summary.vote_summary as EntityRow | undefined) ??
      (summary.votes_summary as EntityRow | undefined) ??
      null
    const parsed = parseVoteSummary(
      voteSummaryRow,
      Array.isArray(summary.votes) ? summary.votes : []
    )

    informationVoteSummary.value = {
      ...parsed,
      currentUserVote:
        parsed.currentUserVote ??
        toVoteValue(
          (summary.current_user_vote as EntityRow | undefined)?.value ??
            (summary.current_vote as EntityRow | undefined)?.value
        )
    }

    relationSections.value = relationSections.value.map((section) =>
      section.key === 'effects' && effects.length > 0
        ? { ...section, items: effects, error: null }
        : section
    )
  } catch (error) {
    console.warn(
      '[ResourceDetailView] Failed to load /information/:id/summary; falling back to /information/:id/votes.',
      error
    )
    const voteRows = await InformationApi.listInformationVotes(currentId.value)
    if (isStaleRequest(requestId)) {
      return
    }
    const values = voteRows.items
      .map((row) => toVoteValue(row.value))
      .filter((value) => value !== null)
    informationVoteSummary.value = {
      up: values.filter((value) => value === 1).length,
      neutral: values.filter((value) => value === 0).length,
      down: values.filter((value) => value === -1).length,
      total: values.length,
      currentUserVote: deriveCurrentUserVoteFromVotes(voteRows.items)
    }
  }
}

async function loadRelationWithFallback(config: RelationSectionConfig): Promise<RelationSection> {
  if (!parentPath.value) {
    return { ...config, items: [], error: null }
  }

  const attemptKeys = [config.key, ...(config.fallbackKeys ?? [])]
  let primaryError: unknown = null
  for (const [index, relationKey] of attemptKeys.entries()) {
    try {
      const response = await SocialApi.listNested(parentPath.value, relationKey)
      return { ...config, key: relationKey, items: response.items, error: null }
    } catch (error) {
      if (index === 0) {
        primaryError = error
      }
      const isPrimary = index === 0
      const isInapplicableMiss = isInapplicableRelationError(error)
      if (isPrimary && !isInapplicableMiss) {
        console.warn(
          `[ResourceDetailView] Failed to load primary relation "${config.key}" for ${parentPath.value}.`,
          error
        )
      }
      if (!isPrimary) {
        console.warn(
          `[ResourceDetailView] Failed fallback relation "${relationKey}" for ${parentPath.value}.`,
          error
        )
      }
    }
  }

  return {
    ...config,
    items: [],
    error:
      primaryError instanceof Error
        ? primaryError.message
        : `Não foi possível carregar ${config.label}.`
  }
}

async function loadRelatedItems(requestId: number) {
  if (!parentPath.value) {
    if (isStaleRequest(requestId)) {
      return
    }
    relatedItems.value = []
    relationSections.value = []
    return
  }

  if (supportsComments.value) {
    const response = await SocialApi.listNested(parentPath.value, 'comments')
    if (isStaleRequest(requestId)) {
      return
    }
    relatedItems.value = response.items
  } else {
    if (isStaleRequest(requestId)) {
      return
    }
    relatedItems.value = []
  }

  const loadedSections = await Promise.all(relationConfigs.value.map(loadRelationWithFallback))
  if (isStaleRequest(requestId)) {
    return
  }
  relationSections.value = loadedSections

  if (resource.value?.key === 'routes') {
    try {
      const tree = await getRouteTree(currentId.value)
      if (isStaleRequest(requestId)) {
        return
      }
      const sectionRows = (Array.isArray(tree.sections) ? tree.sections : []) as EntityRow[]
      if (sectionRows.length > 0) {
        relationSections.value = relationSections.value.map((section) =>
          section.key === 'sections' ? { ...section, items: sectionRows, error: null } : section
        )
      }
    } catch (error) {
      console.warn(
        '[ResourceDetailView] Failed to load /routes/:id/tree; keeping nested sections fallback.',
        error
      )
    }
  }

  await loadInformationVoteSummary(requestId)
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  void (async () => {
    if (!resource.value || !currentId.value) {
      return
    }

    if (resource.value.key === 'media') {
      await router.replace({ name: 'media-detail', params: { id: currentId.value } })
      return
    }

    if (resource.value.key === 'albums') {
      await router.replace({ name: 'album-detail', params: { id: currentId.value } })
      return
    }

    isLoading.value = true
    errorMessage.value = null

    try {
      const loadedItem = await getResource(resource.value.path, currentId.value)
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      item.value = loadedItem
      await loadRelatedItems(requestId)
    } catch (error) {
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível carregar o registro.'
    } finally {
      if (!cancelled && requestId === activeRequestId) {
        isLoading.value = false
      }
    }
  })()
})

async function createComment() {
  if (!parentPath.value || !commentText.value.trim()) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await SocialApi.createNestedComment(parentPath.value, commentText.value.trim())
    commentText.value = ''
    actionMessage.value = 'Comentário publicado.'
    const requestId = ++activeRequestId
    await loadRelatedItems(requestId)
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível publicar o comentário.'
  }
}

async function createRelation(relation: string) {
  if (!parentPath.value) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await SocialApi.createNested(parentPath.value, relation)
    actionMessage.value = relation === 'likes' ? 'Curtido.' : 'Favoritado.'
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível registrar a ação.'
  }
}

async function refreshRelatedItems() {
  const requestId = ++activeRequestId
  await loadRelatedItems(requestId)
}

async function createInformationEffect() {
  if (!currentId.value || !effectFieldName.value.trim() || !effectNewValue.value.trim()) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await InformationApi.createInformationEffect(currentId.value, {
      field_name: effectFieldName.value.trim(),
      old_value: effectOldValue.value.trim() || null,
      new_value: effectNewValue.value.trim()
    })
    effectFieldName.value = ''
    effectOldValue.value = ''
    effectNewValue.value = ''
    actionMessage.value = 'Proposta enviada.'
    const requestId = ++activeRequestId
    await loadRelatedItems(requestId)
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível enviar a proposta.'
  }
}

async function voteOnInformation(value: -1 | 0 | 1) {
  if (!currentId.value) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await InformationApi.createInformationVote(currentId.value, value)
    actionMessage.value = 'Voto registrado.'
    const requestId = ++activeRequestId
    await loadInformationVoteSummary(requestId)
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível registrar o voto.'
  }
}

function summaryVariant(sectionKey: string): SummaryVariant {
  if (sectionKey === 'points') {
    return 'path-point'
  }

  if (
    [
      'freight-car',
      'passenger-car',
      'non-revenue-car',
      'freight-cars',
      'passenger-cars',
      'non-revenue-cars'
    ].includes(sectionKey)
  ) {
    return 'rolling-stock'
  }

  return 'auto'
}
</script>

<template>
  <main class="ResourceDetailView">
    <h1>{{ resource?.label ?? 'Recurso não encontrado' }}</h1>

    <AppCard
      v-if="isLoading"
      class="ResourceDetailView-SkeletonCard"
      aria-label="Carregando detalhes"
    >
      <AppSkeleton width="45%" height="1.4rem" />
      <AppSkeleton width="100%" height="0.95rem" />
      <AppSkeleton width="90%" height="0.95rem" />
      <AppSkeleton width="65%" height="0.95rem" />
    </AppCard>
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-else-if="!resource"
      title="Recurso indisponível"
      description="Este recurso ainda não está configurado no frontend."
    />
    <AppCard v-else-if="item">
      <EntityCard
        :item="item"
        :title-fields="resource.primaryFields"
        :detail-fields="resource.detailFields"
      />
    </AppCard>

    <StatusMessage v-if="actionMessage" state="empty" :message="actionMessage" />
    <StatusMessage v-if="actionErrorMessage" state="error" :message="actionErrorMessage" />

    <section v-if="item && supportsReactions" class="ResourceDetailView-Actions">
      <h2>Ações</h2>
      <button v-if="auth.isLoggedIn" type="button" @click="createRelation('likes')">Curtir</button>
      <button
        v-if="auth.isLoggedIn && resource?.key !== 'comments'"
        type="button"
        @click="createRelation('favorites')"
      >
        Favoritar
      </button>
      <RouterLink v-if="auth.isLoggedIn && resource?.key === 'media'" to="/upload/media">
        Enviar arquivo
      </RouterLink>
      <RouterLink v-if="!auth.isLoggedIn" to="/login">Entre para interagir</RouterLink>
    </section>

    <section v-if="item && supportsInformationContributions" class="ResourceDetailView-Relation">
      <h2>Contribuições</h2>
      <p class="ResourceDetailView-VoteSummary">
        {{ informationVoteSummary.total }} voto(s): {{ informationVoteSummary.up }} concordam,
        {{ informationVoteSummary.neutral }} neutros, {{ informationVoteSummary.down }} discordam.
        <span v-if="informationVoteSummary.currentUserVote !== null">
          Seu voto: {{ informationVoteSummary.currentUserVote }}
        </span>
      </p>
      <template v-if="auth.isLoggedIn">
        <div class="ResourceDetailView-Votes">
          <button type="button" @click="voteOnInformation(1)">Concordo</button>
          <button type="button" @click="voteOnInformation(0)">Neutro</button>
          <button type="button" @click="voteOnInformation(-1)">Discordo</button>
        </div>

        <form class="ResourceDetailView-EffectForm" @submit.prevent="createInformationEffect">
          <label>
            Campo
            <input v-model="effectFieldName" placeholder="nome do campo" />
          </label>
          <label>
            Valor atual
            <input v-model="effectOldValue" placeholder="Opcional" />
          </label>
          <label>
            Valor proposto
            <input v-model="effectNewValue" />
          </label>
          <button type="submit">Propor alteração</button>
        </form>
      </template>
      <RouterLink v-else to="/login">Entre para votar ou propor alterações</RouterLink>
    </section>

    <section v-if="supportsComments" class="ResourceDetailView-Comments">
      <h2>Comentários</h2>
      <form v-if="auth.isLoggedIn" @submit.prevent="createComment">
        <textarea v-model="commentText" placeholder="Escreva um comentário" />
        <button type="submit">Comentar</button>
      </form>
      <CommentSection
        :parent-path="parentPath ?? ''"
        :items="relatedItems"
        @refresh="refreshRelatedItems"
      />
    </section>

    <section
      v-for="section in relationSections"
      :key="section.key"
      class="ResourceDetailView-Relation"
    >
      <h2>{{ section.label }}</h2>
      <StatusMessage v-if="section.error" state="error" :message="section.error" />
      <EmptyState
        v-else-if="section.items.length === 0"
        title="Nenhum registro encontrado"
        description="Não há itens relacionados nesta seção."
      />
      <template v-else-if="resource?.key === 'routes' && section.key === 'sections'">
        <RouterLink
          v-for="related in section.items"
          :key="String(related.id)"
          :to="{
            name: 'route-section-detail',
            params: { routeId: String(route.params.id), sectionId: String(related.id) }
          }"
        >
          <EntityCard :item="related" :title-fields="section.titleFields" />
        </RouterLink>
      </template>
      <template v-else>
        <RoutableEntitySummaryCard
          v-for="related in section.items"
          :key="String(related.id)"
          :item="related"
          :title-fields="section.titleFields"
          :variant="summaryVariant(section.key)"
        />
      </template>
    </section>
  </main>
</template>

<style scoped lang="scss">
.ResourceDetailView {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Actions,
  &-Comments,
  &-Relation {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-5);
  }

  textarea {
    width: 100%;
    min-height: 90px;
  }

  &-EffectForm,
  &-Votes {
    display: grid;
    gap: var(--space-2);
  }

  &-VoteSummary {
    margin: 0;
  }

  &-SkeletonCard {
    display: grid;
    gap: var(--space-2);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
