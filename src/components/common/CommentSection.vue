<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import {
  createCommentLike,
  createNestedComment,
  deleteCommentLike,
  deleteNestedComment,
  getCommentSocialSummary,
  updateNestedComment,
  type SocialSummary
} from '@/services/api/social.api'
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
const editingByRelationId = ref<Record<string, string>>({})
const replyingByCommentId = ref<Record<string, string>>({})
const summariesByCommentId = ref<Record<string, SocialSummary>>({})
const maxDepth = 3
const expandedThreadIds = ref<Record<string, boolean>>({})
const loadedSummaryIds = new Set<string>()
let summaryRequestId = 0
let isUnmounted = false

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

type ThreadItem = {
  row: EntityRow
  commentId: string
  parentId: string | null
  depth: number
  hiddenRepliesCount: number
}

function descendantsCount(
  childrenByParent: Record<string, EntityRow[]>,
  commentId: string
): number {
  const children = childrenByParent[commentId] ?? []
  return children.reduce(
    (total, child) => total + 1 + descendantsCount(childrenByParent, commentIdFor(child) ?? ''),
    0
  )
}

const threadedItems = computed<ThreadItem[]>(() => {
  const withId = props.items.filter((row) => Boolean(commentIdFor(row)))
  const rowsById = new Map(withId.map((row) => [commentIdFor(row) as string, row]))
  const childrenByParent: Record<string, EntityRow[]> = {}
  const roots: EntityRow[] = []

  for (const row of withId) {
    const parentId = repliesToFor(row)
    if (parentId && rowsById.has(parentId)) {
      childrenByParent[parentId] = [...(childrenByParent[parentId] ?? []), row]
      continue
    }
    roots.push(row)
  }

  const ordered: ThreadItem[] = []
  const walk = (row: EntityRow, depth: number) => {
    const commentId = commentIdFor(row)
    if (!commentId) {
      return
    }

    const parentId = repliesToFor(row)
    const children = childrenByParent[commentId] ?? []
    const isCollapsed =
      depth >= maxDepth - 1 && children.length > 0 && !expandedThreadIds.value[commentId]

    ordered.push({
      row,
      commentId,
      parentId,
      depth,
      hiddenRepliesCount: isCollapsed ? descendantsCount(childrenByParent, commentId) : 0
    })

    if (isCollapsed) {
      return
    }

    for (const child of children) {
      walk(child, depth + 1)
    }
  }

  for (const root of roots) {
    walk(root, 0)
  }

  return ordered
})

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

function toggleExpandedReplies(commentId: string) {
  expandedThreadIds.value = {
    ...expandedThreadIds.value,
    [commentId]: !expandedThreadIds.value[commentId]
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
  loadedSummaryIds.add(commentId)
}

watch(
  () => props.items,
  (items, _previous, onCleanup) => {
    const requestId = ++summaryRequestId
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })

    const ids = items.map(commentIdFor).filter((id): id is string => Boolean(id))
    const currentIdSet = new Set(ids)
    const staleIds = Object.keys(summariesByCommentId.value).filter((id) => !currentIdSet.has(id))
    if (staleIds.length > 0) {
      const nextSummaries = { ...summariesByCommentId.value }
      for (const staleId of staleIds) {
        delete nextSummaries[staleId]
        loadedSummaryIds.delete(staleId)
      }
      summariesByCommentId.value = nextSummaries
    }

    const staleExpandedIds = Object.keys(expandedThreadIds.value).filter(
      (id) => !currentIdSet.has(id)
    )
    if (staleExpandedIds.length > 0) {
      const nextExpanded = { ...expandedThreadIds.value }
      for (const staleId of staleExpandedIds) {
        delete nextExpanded[staleId]
      }
      expandedThreadIds.value = nextExpanded
    }

    const idsToFetch = ids.filter((id) => !loadedSummaryIds.has(id))
    if (idsToFetch.length === 0) {
      return
    }

    void Promise.all(
      idsToFetch.map(async (id) => {
        try {
          const summary = await getCommentSocialSummary(id)
          if (cancelled || isUnmounted || requestId !== summaryRequestId) {
            return
          }
          loadedSummaryIds.add(id)
          summariesByCommentId.value = {
            ...summariesByCommentId.value,
            [id]: summary
          }
        } catch (error) {
          if (cancelled || isUnmounted || requestId !== summaryRequestId) {
            return
          }
          console.warn('[CommentSection] Failed to load comment social summary.', error)
        }
      })
    )
  },
  { immediate: true }
)

onUnmounted(() => {
  isUnmounted = true
  summaryRequestId += 1
})
</script>

<template>
  <div class="CommentSection">
    <StatusMessage v-if="actionMessage" state="empty" :message="actionMessage" />
    <StatusMessage v-if="actionErrorMessage" state="error" :message="actionErrorMessage" />
    <EmptyState
      v-if="threadedItems.length === 0"
      title="Nenhum comentário encontrado"
      description="Quando houver comentários, eles aparecerão aqui."
    />

    <article
      v-for="thread in threadedItems"
      :key="thread.commentId"
      class="CommentSection-Item"
      :style="{ '--thread-depth': String(thread.depth) }"
      data-cy="comment-row"
    >
      <p v-if="thread.parentId" class="CommentSection-ReplyContext">Resposta em thread</p>
      <p v-if="thread.hiddenRepliesCount > 0" class="CommentSection-Collapsed">
        {{ thread.hiddenRepliesCount }} resposta(s) adicional(is) ocultas para manter a leitura.
      </p>
      <AppButton
        v-if="thread.hiddenRepliesCount > 0"
        type="button"
        variant="ghost"
        data-cy="comment-expand-replies"
        :aria-expanded="Boolean(expandedThreadIds[thread.commentId])"
        @click="toggleExpandedReplies(thread.commentId)"
      >
        {{ expandedThreadIds[thread.commentId] ? 'Ocultar respostas' : 'Expandir respostas' }}
      </AppButton>

      <p class="CommentSection-Text">{{ commentTextFor(thread.row) || 'Comentário sem texto.' }}</p>

      <p class="CommentSection-Meta">
        {{ commentDateFor(thread.row) ?? 'Data desconhecida' }}
        <span v-if="summariesByCommentId[thread.commentId]">
          · {{ summariesByCommentId[thread.commentId].likes_count }} curtidas
        </span>
      </p>

      <div class="CommentSection-Actions">
        <AppButton
          v-if="auth.isLoggedIn"
          type="button"
          data-cy="comment-like"
          @click="toggleLike(thread.row)"
        >
          {{ summariesByCommentId[thread.commentId]?.liked ? 'Remover curtida' : 'Curtir' }}
        </AppButton>
        <AppButton
          v-if="auth.isLoggedIn"
          type="button"
          data-cy="comment-reply"
          @click="toggleReply(thread.row)"
        >
          Responder
        </AppButton>
        <AppButton
          v-if="canManage(thread.row)"
          type="button"
          data-cy="comment-edit"
          @click="startEdit(thread.row)"
        >
          Editar
        </AppButton>
        <AppButton
          v-if="canManage(thread.row)"
          type="button"
          data-cy="comment-delete"
          variant="danger"
          @click="removeComment(thread.row)"
        >
          Remover
        </AppButton>
        <RouterLink v-if="!auth.isLoggedIn" to="/login">Entre para interagir</RouterLink>
      </div>

      <form
        v-if="editingByRelationId[rowId(thread.row) ?? ''] !== undefined"
        @submit.prevent="saveEdit(thread.row)"
      >
        <textarea
          v-model="editingByRelationId[rowId(thread.row) ?? '']"
          data-cy="comment-edit-text"
          aria-label="Editar comentário"
        />
        <AppButton type="submit" data-cy="comment-edit-submit">Salvar</AppButton>
        <AppButton type="button" variant="ghost" @click="cancelEdit(thread.row)"
          >Cancelar</AppButton
        >
      </form>

      <form
        v-if="replyingByCommentId[commentIdFor(thread.row) ?? ''] !== undefined"
        @submit.prevent="createReply(thread.row)"
      >
        <textarea
          v-model="replyingByCommentId[commentIdFor(thread.row) ?? '']"
          data-cy="comment-reply-text"
          placeholder="Responder comentário"
          aria-label="Responder comentário"
        />
        <AppButton type="submit" data-cy="comment-reply-submit">Responder</AppButton>
        <AppButton type="button" variant="ghost" @click="cancelReply(thread.row)"
          >Cancelar</AppButton
        >
      </form>
    </article>
  </div>
</template>

<style scoped lang="scss">
.CommentSection {
  display: grid;
  gap: var(--space-3);

  &-Item {
    display: grid;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-background-soft);
    padding: var(--space-3);
    margin-inline-start: calc(var(--thread-depth, 0) * var(--space-4));
  }

  &-ReplyContext,
  &-Meta {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  &-Collapsed {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-style: italic;
  }

  &-Text {
    margin: 0;
    white-space: pre-wrap;
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
    min-height: 80px;
  }
}
</style>
