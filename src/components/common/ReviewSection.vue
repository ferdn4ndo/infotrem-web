<script setup lang="ts">
import { ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import {
  isReviewDecision,
  reviewDecisionLabel,
  reviewDecisions,
  type ReviewDecision
} from '@/services/api/review-decisions'
import { deleteNested, updateNested } from '@/services/api/social.api'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'

const props = defineProps<{
  parentPath: string
  items: EntityRow[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

const auth = useAuthStore()
const actionMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)
const editingDecisionById = ref<Record<string, ReviewDecision | ''>>({})
const editingCommentById = ref<Record<string, string>>({})

function stringField(row: EntityRow, field: string) {
  const value = row[field]

  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function canManage(row: EntityRow) {
  const createdById = stringField(row, 'created_by_id')

  return Boolean(auth.isStaff || auth.isAdmin || (auth.user?.id && createdById === auth.user.id))
}

function startEdit(row: EntityRow) {
  const id = stringField(row, 'id')
  if (!id) {
    return
  }

  editingDecisionById.value = {
    ...editingDecisionById.value,
    [id]: normalizeDecision(stringField(row, 'decision'))
  }
  editingCommentById.value = {
    ...editingCommentById.value,
    [id]: stringField(row, 'comment') ?? ''
  }
}

function cancelEdit(row: EntityRow) {
  const id = stringField(row, 'id')
  if (!id) {
    return
  }

  const decisions = { ...editingDecisionById.value }
  const comments = { ...editingCommentById.value }
  delete decisions[id]
  delete comments[id]
  editingDecisionById.value = decisions
  editingCommentById.value = comments
}

function normalizeDecision(value: string | null): ReviewDecision | '' {
  return value && isReviewDecision(value) ? value : ''
}

async function saveReview(row: EntityRow) {
  const id = stringField(row, 'id')
  if (!id) {
    return
  }

  const decision = editingDecisionById.value[id]?.trim()
  const comment = editingCommentById.value[id]?.trim()
  if (!decision && !comment) {
    actionErrorMessage.value = 'Preencha a decisão ou comentário da avaliação.'
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await updateNested(props.parentPath, 'reviews', id, {
      decision: decision || undefined,
      comment: comment || undefined
    })
    cancelEdit(row)
    actionMessage.value = 'Avaliação atualizada.'
    emit('refresh')
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível atualizar a avaliação.'
  }
}

async function decideReview(row: EntityRow, decision: ReviewDecision) {
  const id = stringField(row, 'id')
  if (!id) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await updateNested(props.parentPath, 'reviews', id, { decision })
    actionMessage.value = `Avaliação marcada como ${reviewDecisionLabel(decision).toLowerCase()}.`
    emit('refresh')
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível registrar a decisão da avaliação.'
  }
}

async function deleteReview(row: EntityRow) {
  const id = stringField(row, 'id')
  if (!id) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await deleteNested(props.parentPath, 'reviews', id)
    actionMessage.value = 'Avaliação removida.'
    emit('refresh')
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível remover a avaliação.'
  }
}
</script>

<template>
  <div class="ReviewSection">
    <StatusMessage v-if="actionMessage" state="empty" :message="actionMessage" />
    <StatusMessage v-if="actionErrorMessage" state="error" :message="actionErrorMessage" />
    <EmptyState
      v-if="items.length === 0"
      title="Nenhuma avaliação encontrada"
      description="Ainda não há avaliações para este item."
    />

    <article
      v-for="review in items"
      :key="String(review.id)"
      class="ReviewSection-Item"
      data-cy="review-row"
    >
      <p>
        <strong>{{ reviewDecisionLabel(stringField(review, 'decision')) }}</strong>
      </p>
      <p>{{ stringField(review, 'comment') ?? 'Sem comentário.' }}</p>
      <p class="ReviewSection-Meta">
        {{ stringField(review, 'created_at') ?? 'Data desconhecida' }}
      </p>

      <div v-if="canManage(review)" class="ReviewSection-Actions">
        <AppButton
          v-if="auth.isStaff || auth.isAdmin"
          type="button"
          variant="ghost"
          data-cy="review-approve"
          @click="decideReview(review, 'approve')"
        >
          Aprovar
        </AppButton>
        <AppButton
          v-if="auth.isStaff || auth.isAdmin"
          type="button"
          variant="ghost"
          data-cy="review-reject"
          @click="decideReview(review, 'reject')"
        >
          Rejeitar
        </AppButton>
        <AppButton
          v-if="auth.isStaff || auth.isAdmin"
          type="button"
          variant="ghost"
          data-cy="review-needs-changes"
          @click="decideReview(review, 'needs_changes')"
        >
          Pedir ajustes
        </AppButton>
        <AppButton type="button" data-cy="review-edit" @click="startEdit(review)">Editar</AppButton>
        <AppButton
          type="button"
          data-cy="review-delete"
          variant="danger"
          @click="deleteReview(review)"
        >
          Remover
        </AppButton>
      </div>

      <form
        v-if="editingDecisionById[stringField(review, 'id') ?? ''] !== undefined"
        @submit.prevent="saveReview(review)"
      >
        <label>
          Decisão
          <select
            v-model="editingDecisionById[stringField(review, 'id') ?? '']"
            data-cy="review-decision"
          >
            <option value="">Sem decisão</option>
            <option
              v-for="decision in reviewDecisions"
              :key="decision.value"
              :value="decision.value"
            >
              {{ decision.label }}
            </option>
          </select>
        </label>
        <label>
          Comentário
          <textarea
            v-model="editingCommentById[stringField(review, 'id') ?? '']"
            data-cy="review-comment"
          />
        </label>
        <AppButton type="submit" data-cy="review-submit">Salvar avaliação</AppButton>
        <AppButton type="button" variant="ghost" @click="cancelEdit(review)">Cancelar</AppButton>
      </form>
    </article>
  </div>
</template>

<style scoped lang="scss">
.ReviewSection {
  display: grid;
  gap: var(--space-3);

  &-Item {
    display: grid;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-background-soft);
    padding: var(--space-4);
  }

  &-Meta {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  &-Actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  form {
    display: grid;
    gap: var(--space-2);
  }

  textarea {
    width: 100%;
    min-height: 90px;
  }
}
</style>
