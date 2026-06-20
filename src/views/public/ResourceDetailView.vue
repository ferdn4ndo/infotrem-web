<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppField from '@/components/common/AppField.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppSkeleton from '@/components/common/AppSkeleton.vue'
import CommentSection from '@/components/common/CommentSection.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import RelationManager from '@/components/common/RelationManager.vue'
import ResourceForm from '@/components/common/ResourceForm.vue'
import SigoSeriesManager from '@/components/common/SigoSeriesManager.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import * as InformationApi from '@/services/api/information.api'
import { canDelete, canEdit } from '@/services/api/permissions'
import { findResource } from '@/services/api/resources'
import { deleteResource, getResource } from '@/services/api/resources.api'
import * as SocialApi from '@/services/api/social.api'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'

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
const commentItems = ref<EntityRow[]>([])
const informationEffects = ref<EntityRow[]>([])
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
const isEditingMain = ref(false)
const confirmMainDeleteOpen = ref(false)
let activeRequestId = 0

const resource = computed(() => findResource(String(route.params.resource)))
const currentId = computed(() => String(route.params.id ?? ''))
const parentPath = computed(() =>
  resource.value && route.params.id ? `${resource.value.path}/${String(route.params.id)}` : null
)
const supportsComments = computed(() => ['media', 'albums'].includes(String(resource.value?.key)))
const supportsInformationContributions = computed(() => resource.value?.key === 'information')
const canEditMain = computed(() => (resource.value ? canEdit(resource.value, auth) : false))
const canDeleteMain = computed(() => (resource.value ? canDelete(resource.value, auth) : false))
const visibleRelations = computed(() =>
  (resource.value?.relations ?? []).filter((relation) => {
    if (supportsComments.value && relation.pathSuffix === 'comments') {
      return false
    }
    if (
      supportsInformationContributions.value &&
      ['effects', 'votes', 'sigo-series'].includes(relation.pathSuffix)
    ) {
      return false
    }
    return true
  })
)

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
    if (userIdForVoteRow(row) === currentUserId) {
      return toVoteValue(row.value)
    }
  }
  return null
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
    informationEffects.value = []
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
    if (requestId !== activeRequestId) {
      return
    }
    informationEffects.value = Array.isArray(summary.effects) ? summary.effects : []
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
  } catch (error) {
    console.warn(
      '[ResourceDetailView] Falha ao carregar /information/:id/summary. Fallback para votos/effects.',
      error
    )
    const [voteRows, effectRows] = await Promise.all([
      InformationApi.listInformationVotes(currentId.value),
      SocialApi.listNested(`/information/${currentId.value}`, 'effects')
    ])
    if (requestId !== activeRequestId) {
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
    informationEffects.value = effectRows.items
  }
}

async function loadComments(requestId: number) {
  if (!supportsComments.value || !parentPath.value) {
    commentItems.value = []
    return
  }
  const response = await SocialApi.listNested(parentPath.value, 'comments')
  if (requestId !== activeRequestId) {
    return
  }
  commentItems.value = response.items
}

async function loadSecondaryRelations(requestId: number) {
  const relationLoads = [
    loadComments(requestId).catch((error) => {
      console.warn('[ResourceDetailView] Falha ao carregar comentários.', error)
    }),
    loadInformationVoteSummary(requestId).catch((error) => {
      console.warn('[ResourceDetailView] Falha ao carregar contribuições da informação.', error)
    })
  ]
  await Promise.all(relationLoads)
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
    } catch (error) {
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível carregar o registro.'
      return
    } finally {
      await loadSecondaryRelations(requestId)
      if (!cancelled && requestId === activeRequestId) {
        isLoading.value = false
      }
    }
  })()
})

async function refreshViewData() {
  const requestId = ++activeRequestId
  await Promise.all([loadComments(requestId), loadInformationVoteSummary(requestId)])
  if (resource.value) {
    item.value = await getResource(resource.value.path, currentId.value)
  }
}

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
    await refreshViewData()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível publicar o comentário.'
  }
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
    await refreshViewData()
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
    await refreshViewData()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível registrar o voto.'
  }
}

async function handleDeleteMainRecord() {
  if (!resource.value || !item.value?.id) {
    return
  }
  actionErrorMessage.value = null
  actionMessage.value = null
  try {
    await deleteResource(resource.value.path, String(item.value.id))
    confirmMainDeleteOpen.value = false
    await router.push({ name: 'resource-list', params: { resource: resource.value.key } })
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível excluir o registro.'
  }
}
</script>

<template>
  <section class="ResourceDetailView">
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
      <div v-if="canEditMain || canDeleteMain" class="ResourceDetailView-MainActions">
        <AppButton v-if="canEditMain" type="button" variant="ghost" @click="isEditingMain = true">
          Editar
        </AppButton>
        <AppButton
          v-if="canDeleteMain"
          type="button"
          variant="danger"
          @click="confirmMainDeleteOpen = true"
        >
          Excluir
        </AppButton>
      </div>
    </AppCard>

    <AppCard v-if="isEditingMain && resource && item" class="ResourceDetailView-EditCard">
      <h2>Editar registro</h2>
      <ResourceForm
        :resource="resource"
        :record="item"
        submit-label="Salvar"
        @saved="
          async (saved) => {
            item = saved
            isEditingMain = false
            await refreshViewData()
          }
        "
        @cancel="isEditingMain = false"
      />
    </AppCard>

    <StatusMessage v-if="actionMessage" state="empty" :message="actionMessage" />
    <StatusMessage v-if="actionErrorMessage" state="error" :message="actionErrorMessage" />

    <section v-if="item && resource?.key === 'media'" class="ResourceDetailView-Actions">
      <RouterLink v-if="auth.isLoggedIn" to="/upload/media">Enviar arquivo</RouterLink>
      <RouterLink v-else to="/login">Entre para interagir</RouterLink>
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
          <AppButton type="button" @click="voteOnInformation(1)">Concordo</AppButton>
          <AppButton type="button" @click="voteOnInformation(0)">Neutro</AppButton>
          <AppButton type="button" @click="voteOnInformation(-1)">Discordo</AppButton>
        </div>

        <form class="ResourceDetailView-EffectForm" @submit.prevent="createInformationEffect">
          <AppField label="Campo" required>
            <template #default="{ id, required }">
              <AppInput :id="id" v-model="effectFieldName" :required="required" />
            </template>
          </AppField>
          <AppField label="Valor atual">
            <template #default="{ id }">
              <AppInput :id="id" v-model="effectOldValue" />
            </template>
          </AppField>
          <AppField label="Valor proposto" required>
            <template #default="{ id, required }">
              <AppInput :id="id" v-model="effectNewValue" :required="required" />
            </template>
          </AppField>
          <AppButton type="submit">Propor alteração</AppButton>
        </form>
      </template>
      <RouterLink v-else to="/login">Entre para votar ou propor alterações</RouterLink>
      <div class="ResourceDetailView-Effects">
        <EntityCard
          v-for="effect in informationEffects"
          :key="String(effect.id)"
          :item="effect"
          :title-fields="['field_name', 'new_value', 'id']"
        />
      </div>
    </section>

    <SigoSeriesManager v-if="supportsInformationContributions" :information-id="currentId" />

    <section v-if="supportsComments" class="ResourceDetailView-Comments">
      <h2>Comentários</h2>
      <form v-if="auth.isLoggedIn" @submit.prevent="createComment">
        <AppField label="Comentário" required>
          <template #default="{ id, required }">
            <AppInput :id="id" v-model="commentText" :required="required" />
          </template>
        </AppField>
        <AppButton type="submit">Comentar</AppButton>
      </form>
      <CommentSection
        :parent-path="parentPath ?? ''"
        :items="commentItems"
        @refresh="refreshViewData"
      />
    </section>

    <template v-if="resource">
      <RelationManager
        v-for="relation in visibleRelations"
        :key="relation.key"
        :relation="relation"
        :parent-resource="resource"
        :parent-id="currentId"
      />
    </template>

    <ConfirmDialog
      v-model="confirmMainDeleteOpen"
      title="Confirmar exclusão"
      message="Deseja realmente excluir este registro?"
      confirm-label="Excluir"
      @confirm="handleDeleteMainRecord"
      @cancel="confirmMainDeleteOpen = false"
    />
  </section>
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

  &-Effects {
    display: grid;
    gap: var(--space-2);
  }

  &-MainActions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  &-EditCard {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-4);
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
