<script setup lang="ts">
import { ref } from 'vue'

import {
  isReviewDecision,
  reviewDecisionLabel,
  reviewDecisions,
  type ReviewDecision
} from '@/services/api/review-decisions'
import { deleteNested, updateNested } from '@/services/api/social.api'
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
    <p v-if="actionMessage">{{ actionMessage }}</p>
    <p v-if="actionErrorMessage">{{ actionErrorMessage }}</p>

    <p v-if="items.length === 0">Nenhuma avaliação encontrada.</p>

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
        <button type="button" data-cy="review-edit" @click="startEdit(review)">Editar</button>
        <button type="button" data-cy="review-delete" @click="deleteReview(review)">Remover</button>
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
        <button type="submit" data-cy="review-submit">Salvar avaliação</button>
        <button type="button" @click="cancelEdit(review)">Cancelar</button>
      </form>
    </article>
  </div>
</template>

<style scoped lang="scss">
.ReviewSection {
  display: grid;
  gap: 12px;

  &-Item {
    display: grid;
    gap: 10px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-background-soft);
    padding: 16px;
  }

  &-Meta {
    color: var(--color-text-secondary);
    font-size: 13px;
  }

  &-Actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  form {
    display: grid;
    gap: 8px;
  }

  textarea {
    width: 100%;
    min-height: 90px;
  }
}
</style>
