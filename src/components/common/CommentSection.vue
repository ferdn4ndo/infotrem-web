<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import {
  createCommentLike,
  createNestedComment,
  deleteCommentLike,
  deleteNestedComment,
  getCommentSocialSummary,
  updateNestedComment,
  type SocialSummary
} from '@/services/api/social.api'
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
const editingByRelationId = ref<Record<string, string>>({})
const replyingByCommentId = ref<Record<string, string>>({})
const summariesByCommentId = ref<Record<string, SocialSummary>>({})

const currentUserId = computed(() => auth.user?.id?.toString() ?? null)

function rowId(row: EntityRow) {
  return stringField(row, 'id')
}

function commentFor(row: EntityRow) {
  const comment = row.comment

  return comment && typeof comment === 'object' && !Array.isArray(comment)
    ? (comment as EntityRow)
    : row
}

function commentIdFor(row: EntityRow) {
  return stringField(commentFor(row), 'id') ?? stringField(row, 'comment_id')
}

function commentTextFor(row: EntityRow) {
  return stringField(commentFor(row), 'text') ?? stringField(row, 'comment_text') ?? ''
}

function commentAuthorFor(row: EntityRow) {
  return stringField(commentFor(row), 'created_by_id') ?? stringField(row, 'created_by_id')
}

function commentDateFor(row: EntityRow) {
  return stringField(commentFor(row), 'created_at') ?? stringField(row, 'created_at')
}

function repliesToFor(row: EntityRow) {
  return stringField(commentFor(row), 'replies_to_id') ?? stringField(row, 'comment_replies_to_id')
}

function stringField(row: EntityRow, field: string) {
  const value = row[field]

  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function canManage(row: EntityRow) {
  const authorId = commentAuthorFor(row)

  return Boolean(
    auth.isStaff || auth.isAdmin || (currentUserId.value && authorId === currentUserId.value)
  )
}

function startEdit(row: EntityRow) {
  const relationId = rowId(row)
  if (!relationId) {
    return
  }

  editingByRelationId.value = {
    ...editingByRelationId.value,
    [relationId]: commentTextFor(row)
  }
}

function cancelEdit(row: EntityRow) {
  const relationId = rowId(row)
  if (!relationId) {
    return
  }

  const next = { ...editingByRelationId.value }
  delete next[relationId]
  editingByRelationId.value = next
}

function toggleReply(row: EntityRow) {
  const commentId = commentIdFor(row)
  if (!commentId) {
    return
  }

  replyingByCommentId.value = {
    ...replyingByCommentId.value,
    [commentId]: replyingByCommentId.value[commentId] ?? ''
  }
}

function cancelReply(row: EntityRow) {
  const commentId = commentIdFor(row)
  if (!commentId) {
    return
  }

  const next = { ...replyingByCommentId.value }
  delete next[commentId]
  replyingByCommentId.value = next
}

async function saveEdit(row: EntityRow) {
  const relationId = rowId(row)
  const text = relationId ? editingByRelationId.value[relationId]?.trim() : ''
  if (!relationId || !text) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await updateNestedComment(props.parentPath, relationId, text, repliesToFor(row))
    cancelEdit(row)
    actionMessage.value = 'Comentário atualizado.'
    emit('refresh')
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível atualizar o comentário.'
  }
}

async function removeComment(row: EntityRow) {
  const relationId = rowId(row)
  if (!relationId) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await deleteNestedComment(props.parentPath, relationId)
    actionMessage.value = 'Comentário removido.'
    emit('refresh')
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível remover o comentário.'
  }
}

async function createReply(row: EntityRow) {
  const commentId = commentIdFor(row)
  const text = commentId ? replyingByCommentId.value[commentId]?.trim() : ''
  if (!commentId || !text) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await createNestedComment(props.parentPath, text, commentId)
    cancelReply(row)
    actionMessage.value = 'Resposta publicada.'
    emit('refresh')
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível publicar a resposta.'
  }
}

async function toggleLike(row: EntityRow) {
  const commentId = commentIdFor(row)
  if (!commentId) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    const summary = summariesByCommentId.value[commentId]
    if (summary?.liked && summary.like_id) {
      await deleteCommentLike(commentId, summary.like_id)
      actionMessage.value = 'Curtida removida.'
    } else {
      await createCommentLike(commentId)
      actionMessage.value = 'Comentário curtido.'
    }
    await loadSummary(commentId)
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível atualizar a curtida.'
  }
}

async function loadSummary(commentId: string) {
  summariesByCommentId.value = {
    ...summariesByCommentId.value,
    [commentId]: await getCommentSocialSummary(commentId)
  }
}

watch(
  () => props.items,
  async (items) => {
    const ids = items.map(commentIdFor).filter((id): id is string => Boolean(id))
    await Promise.all(ids.map((id) => loadSummary(id)))
  },
  { immediate: true }
)
</script>

<template>
  <div class="CommentSection">
    <p v-if="actionMessage">{{ actionMessage }}</p>
    <p v-if="actionErrorMessage">{{ actionErrorMessage }}</p>

    <p v-if="items.length === 0">Nenhum comentário encontrado.</p>

    <article
      v-for="row in items"
      :key="String(row.id)"
      class="CommentSection-Item"
      data-cy="comment-row"
    >
      <p v-if="repliesToFor(row)" class="CommentSection-ReplyContext">
        Em resposta a {{ repliesToFor(row) }}
      </p>

      <p class="CommentSection-Text">{{ commentTextFor(row) || 'Comentário sem texto.' }}</p>

      <p class="CommentSection-Meta">
        {{ commentDateFor(row) ?? 'Data desconhecida' }}
        <span v-if="summariesByCommentId[commentIdFor(row) ?? '']">
          · {{ summariesByCommentId[commentIdFor(row) ?? ''].likes_count }} curtidas
        </span>
      </p>

      <div class="CommentSection-Actions">
        <button
          v-if="auth.isLoggedIn"
          type="button"
          data-cy="comment-like"
          @click="toggleLike(row)"
        >
          {{ summariesByCommentId[commentIdFor(row) ?? '']?.liked ? 'Remover curtida' : 'Curtir' }}
        </button>
        <button
          v-if="auth.isLoggedIn"
          type="button"
          data-cy="comment-reply"
          @click="toggleReply(row)"
        >
          Responder
        </button>
        <button v-if="canManage(row)" type="button" data-cy="comment-edit" @click="startEdit(row)">
          Editar
        </button>
        <button
          v-if="canManage(row)"
          type="button"
          data-cy="comment-delete"
          @click="removeComment(row)"
        >
          Remover
        </button>
        <RouterLink v-if="!auth.isLoggedIn" to="/login">Entre para interagir</RouterLink>
      </div>

      <form
        v-if="editingByRelationId[rowId(row) ?? ''] !== undefined"
        @submit.prevent="saveEdit(row)"
      >
        <textarea v-model="editingByRelationId[rowId(row) ?? '']" data-cy="comment-edit-text" />
        <button type="submit" data-cy="comment-edit-submit">Salvar</button>
        <button type="button" @click="cancelEdit(row)">Cancelar</button>
      </form>

      <form
        v-if="replyingByCommentId[commentIdFor(row) ?? ''] !== undefined"
        @submit.prevent="createReply(row)"
      >
        <textarea
          v-model="replyingByCommentId[commentIdFor(row) ?? '']"
          data-cy="comment-reply-text"
          placeholder="Responder comentário"
        />
        <button type="submit" data-cy="comment-reply-submit">Responder</button>
        <button type="button" @click="cancelReply(row)">Cancelar</button>
      </form>
    </article>
  </div>
</template>

<style scoped lang="scss">
.CommentSection {
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

  &-ReplyContext,
  &-Meta {
    color: var(--color-text-secondary);
    font-size: 13px;
  }

  &-Text {
    margin: 0;
    white-space: pre-wrap;
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
    min-height: 80px;
  }
}
</style>
