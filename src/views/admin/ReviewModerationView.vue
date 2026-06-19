<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { reviewDecisionLabel, type ReviewDecision } from '@/services/api/review-decisions'
import { listResource } from '@/services/api/resources.api'
import { updateNested } from '@/services/api/social.api'
import type { EntityRow } from '@/types/domain/common.type'

const pageLimit = 20
const offset = ref(0)
const rows = ref<EntityRow[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)
let activeRequestId = 0

function stringField(row: EntityRow, ...fields: string[]) {
  for (const field of fields) {
    const value = row[field]
    if (value !== null && value !== undefined && value !== '') {
      return String(value)
    }
  }
  return null
}

async function loadReviews() {
  const requestId = ++activeRequestId
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await listResource('/media-reviews', {
      limit: pageLimit,
      offset: offset.value
    })
    if (requestId !== activeRequestId) {
      return
    }
    rows.value = response.items
    totalCount.value = response.count
  } catch (error) {
    if (requestId !== activeRequestId) {
      return
    }
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar a fila de moderação.'
  } finally {
    if (requestId === activeRequestId) {
      isLoading.value = false
    }
  }
}

async function decideReview(row: EntityRow, decision: ReviewDecision) {
  const reviewId = stringField(row, 'review_id', 'id')
  const mediaId = stringField(row, 'media_item_id', 'media_id')
  if (!reviewId || !mediaId) {
    actionErrorMessage.value = 'Avaliação inválida para moderação.'
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await updateNested(`/media/${mediaId}`, 'reviews', reviewId, { decision })
    actionMessage.value = `Avaliação marcada como ${reviewDecisionLabel(decision).toLowerCase()}.`
    await loadReviews()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível atualizar a avaliação.'
  }
}

watchEffect(() => {
  void loadReviews()
})
</script>

<template>
  <main class="ReviewModerationView">
    <h1>Moderação de avaliações</h1>
    <p>Fila global de avaliações para revisão da equipe.</p>

    <StatusMessage v-if="actionMessage" state="empty" :message="actionMessage" />
    <StatusMessage v-if="actionErrorMessage" state="error" :message="actionErrorMessage" />
    <StatusMessage v-if="isLoading" state="loading" message="Carregando fila de moderação..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />
    <EmptyState
      v-else-if="rows.length === 0"
      title="Sem avaliações pendentes"
      description="Não há avaliações para moderar no momento."
    />

    <section v-else class="ReviewModerationView-List">
      <AppCard
        v-for="row in rows"
        :key="
          stringField(row, 'review_id', 'id') ??
          `${stringField(row, 'media_item_id', 'media_id')}-${stringField(row, 'created_at')}`
        "
        class="ReviewModerationView-Row"
        data-cy="moderation-row"
      >
        <p>
          <strong>Mídia:</strong>
          <RouterLink
            :to="{
              name: 'media-detail',
              params: { id: stringField(row, 'media_item_id', 'media_id') }
            }"
            data-cy="moderation-media-link"
          >
            #{{ stringField(row, 'media_item_id', 'media_id') }}
          </RouterLink>
        </p>
        <p><strong>Decisão:</strong> {{ reviewDecisionLabel(stringField(row, 'decision')) }}</p>
        <p><strong>Comentário:</strong> {{ stringField(row, 'comment') ?? 'Sem comentário.' }}</p>
        <p class="ReviewModerationView-Meta">
          Criado em {{ stringField(row, 'created_at') ?? 'data desconhecida' }} · Atualizado em
          {{ stringField(row, 'updated_at') ?? 'data desconhecida' }}
        </p>
        <div class="ReviewModerationView-Actions">
          <AppButton
            type="button"
            variant="ghost"
            data-cy="moderation-approve"
            @click="decideReview(row, 'approve')"
          >
            Aprovar
          </AppButton>
          <AppButton
            type="button"
            variant="ghost"
            data-cy="moderation-needs-changes"
            @click="decideReview(row, 'needs_changes')"
          >
            Precisa de ajustes
          </AppButton>
          <AppButton
            type="button"
            variant="ghost"
            data-cy="moderation-reject"
            @click="decideReview(row, 'reject')"
          >
            Rejeitar
          </AppButton>
        </div>
      </AppCard>
    </section>

    <AppPagination
      v-if="totalCount > pageLimit"
      :count="totalCount"
      :limit="pageLimit"
      :offset="offset"
      @update:offset="offset = $event"
    />
  </main>
</template>

<style scoped lang="scss">
.ReviewModerationView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-4);
  padding: var(--space-4);

  h1,
  p {
    margin: 0;
  }

  &-List {
    display: grid;
    gap: var(--space-3);
  }

  &-Row {
    display: grid;
    gap: var(--space-2);
  }

  &-Meta {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  &-Actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
