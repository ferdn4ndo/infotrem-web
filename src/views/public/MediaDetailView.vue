<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import CommentSection from '@/components/common/CommentSection.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import ReviewSection from '@/components/common/ReviewSection.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import {
  createMediaDownload,
  getMedia,
  listMediaRelation,
  mediaRawUrl
} from '@/services/api/media.api'
import {
  createNested,
  createNestedComment,
  deleteSocialRelation,
  getSocialSummary,
  type SocialSummary
} from '@/services/api/social.api'
import { reviewDecisions, type ReviewDecision } from '@/services/api/review-decisions'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'
import type { MediaRow } from '@/types/domain/media.type'

type RelationSection = {
  key: string
  label: string
  items: EntityRow[]
  error: string | null
}

const route = useRoute()
const auth = useAuthStore()
const item = ref<MediaRow | null>(null)
const socialSummary = ref<SocialSummary | null>(null)
const relationSections = ref<RelationSection[]>([])
const commentText = ref('')
const reviewDecision = ref<ReviewDecision>('approve')
const reviewComment = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)
const rawHref = ref<string | null>(null)

const mediaId = computed(() => String(route.params.id ?? ''))
const storageId = computed(() => stringField(item.value, 'filemgr_storage_id'))
const fileId = computed(() => stringField(item.value, 'filemgr_file_id'))
const canDownload = computed(() => Boolean(storageId.value && fileId.value))

const relationConfigs = [
  { key: 'images', label: 'Imagens' },
  { key: 'image-sizes', label: 'Tamanhos de imagem' },
  { key: 'videos', label: 'Vídeos' },
  { key: 'documents', label: 'Documentos' },
  { key: 'albums', label: 'Álbuns' },
  { key: 'rolling-stock', label: 'Material rodante' },
  { key: 'comments', label: 'Comentários' },
  { key: 'reviews', label: 'Avaliações' }
]

function stringField(row: EntityRow | null, field: string) {
  const value = row?.[field]

  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function extractDownloadId(row: EntityRow) {
  return (
    stringField(row, 'download_id') ??
    stringField(row, 'id') ??
    stringField(row, 'uuid') ??
    stringField(row, 'file_id')
  )
}

async function loadRelation(key: string, label: string): Promise<RelationSection> {
  try {
    const response = await listMediaRelation(mediaId.value, key)

    return { key, label, items: response.items, error: null }
  } catch (error) {
    return {
      key,
      label,
      items: [],
      error: error instanceof Error ? error.message : `Não foi possível carregar ${label}.`
    }
  }
}

async function loadMedia() {
  if (!mediaId.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = null
  actionMessage.value = null
  actionErrorMessage.value = null
  rawHref.value = null

  try {
    item.value = await getMedia(mediaId.value)
    socialSummary.value = await getSocialSummary(`/media/${mediaId.value}`)
    relationSections.value = await Promise.all(
      relationConfigs.map((config) => loadRelation(config.key, config.label))
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar mídia.'
  } finally {
    isLoading.value = false
  }
}

async function createComment() {
  if (!commentText.value.trim()) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await createNestedComment(`/media/${mediaId.value}`, commentText.value.trim())
    commentText.value = ''
    actionMessage.value = 'Comentário publicado.'
    await refreshComments()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível publicar o comentário.'
  }
}

async function refreshComments() {
  const comments = await loadRelation('comments', 'Comentários')
  relationSections.value = relationSections.value.map((section) =>
    section.key === 'comments' ? comments : section
  )
}

async function refreshReviews() {
  const reviews = await loadRelation('reviews', 'Avaliações')
  relationSections.value = relationSections.value.map((section) =>
    section.key === 'reviews' ? reviews : section
  )
}

async function createRelation(relation: 'favorites' | 'likes') {
  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await createNested(`/media/${mediaId.value}`, relation)
    socialSummary.value = await getSocialSummary(`/media/${mediaId.value}`)
    actionMessage.value = relation === 'likes' ? 'Curtido.' : 'Favoritado.'
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível registrar a ação.'
  }
}

function relationIdFor(relation: 'favorites' | 'likes') {
  if (relation === 'likes') {
    return socialSummary.value?.like_id ?? null
  }

  return socialSummary.value?.favorite_id ?? null
}

async function deleteRelation(relation: 'favorites' | 'likes') {
  const relationId = relationIdFor(relation)
  if (!relationId) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await deleteSocialRelation(`/media/${mediaId.value}`, relation, relationId)
    socialSummary.value = await getSocialSummary(`/media/${mediaId.value}`)
    actionMessage.value = relation === 'likes' ? 'Curtida removida.' : 'Favorito removido.'
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível remover a ação.'
  }
}

async function createReview() {
  if (!reviewDecision.value.trim() && !reviewComment.value.trim()) {
    actionErrorMessage.value = 'Preencha a decisão ou comentário da avaliação.'
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    await createNested(`/media/${mediaId.value}`, 'reviews', {
      decision: reviewDecision.value,
      comment: reviewComment.value.trim() || undefined
    })
    reviewDecision.value = 'approve'
    reviewComment.value = ''
    actionMessage.value = 'Avaliação registrada.'
    await refreshReviews()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível registrar a avaliação.'
  }
}

async function prepareDownload() {
  if (!storageId.value || !fileId.value) {
    return
  }

  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    const download = await createMediaDownload(mediaId.value, storageId.value, fileId.value)
    const downloadId = extractDownloadId(download)

    if (!downloadId) {
      throw new Error('Download response did not include a download id.')
    }

    rawHref.value = mediaRawUrl(mediaId.value, storageId.value, fileId.value, downloadId)
    actionMessage.value = 'Download preparado.'
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível preparar o download.'
  }
}

watchEffect(loadMedia)
</script>

<template>
  <main class="MediaDetailView">
    <RouterLink :to="{ name: 'media-list' }">Voltar para mídia</RouterLink>

    <h1>{{ item?.title ?? item?.name ?? 'Mídia' }}</h1>

    <p v-if="isLoading">Carregando mídia...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <EntityCard
      v-if="item"
      :item="item"
      :title-fields="['title', 'name', 'description', 'id']"
      :detail-fields="['status', 'type', 'original_url', 'references', 'location_id']"
    />

    <section v-if="item" class="MediaDetailView-Actions">
      <h2>Ações</h2>
      <p v-if="socialSummary">
        {{ socialSummary.likes_count }} curtidas ·
        {{ socialSummary.favorites_count ?? 0 }} favoritos
      </p>
      <RouterLink
        v-if="item.location_id"
        :to="{
          name: 'resource-detail',
          params: { resource: 'locations', id: String(item.location_id) }
        }"
      >
        Ver local relacionado
      </RouterLink>
      <button
        v-if="auth.isLoggedIn"
        type="button"
        data-cy="media-like"
        @click="socialSummary?.liked ? deleteRelation('likes') : createRelation('likes')"
      >
        {{ socialSummary?.liked ? 'Remover curtida' : 'Curtir' }}
      </button>
      <button
        v-if="auth.isLoggedIn"
        type="button"
        data-cy="media-favorite"
        @click="
          socialSummary?.favorited ? deleteRelation('favorites') : createRelation('favorites')
        "
      >
        {{ socialSummary?.favorited ? 'Remover favorito' : 'Favoritar' }}
      </button>
      <button
        v-if="auth.isLoggedIn && canDownload"
        type="button"
        data-cy="media-download"
        @click="prepareDownload"
      >
        Preparar download
      </button>
      <a v-if="rawHref" :href="rawHref" target="_blank" rel="noreferrer">Abrir arquivo</a>
      <RouterLink v-if="auth.isLoggedIn" to="/upload/media">Enviar arquivo</RouterLink>
      <RouterLink v-else to="/login">Entre para interagir</RouterLink>
    </section>

    <p v-if="actionMessage">{{ actionMessage }}</p>
    <p v-if="actionErrorMessage">{{ actionErrorMessage }}</p>

    <section v-if="item" class="MediaDetailView-Comments">
      <h2>Novo comentário</h2>
      <form v-if="auth.isLoggedIn" data-cy="media-comment-form" @submit.prevent="createComment">
        <textarea
          v-model="commentText"
          data-cy="media-comment-text"
          placeholder="Escreva um comentário"
        />
        <button type="submit" data-cy="media-comment-submit">Comentar</button>
      </form>
      <RouterLink v-else to="/login">Entre para comentar</RouterLink>
    </section>

    <section v-if="item" class="MediaDetailView-Section">
      <h2>Nova avaliação</h2>
      <form v-if="auth.isLoggedIn" data-cy="media-review-form" @submit.prevent="createReview">
        <label>
          Decisão
          <select v-model="reviewDecision" data-cy="media-review-decision">
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
            v-model="reviewComment"
            data-cy="media-review-comment"
            placeholder="Observações da avaliação"
          />
        </label>
        <button type="submit" data-cy="media-review-submit">Registrar avaliação</button>
      </form>
      <RouterLink v-else to="/login">Entre para avaliar</RouterLink>
    </section>

    <section v-for="section in relationSections" :key="section.key" class="MediaDetailView-Section">
      <h2>{{ section.label }}</h2>
      <p v-if="section.error">{{ section.error }}</p>
      <CommentSection
        v-else-if="section.key === 'comments'"
        :parent-path="`/media/${mediaId}`"
        :items="section.items"
        @refresh="refreshComments"
      />
      <ReviewSection
        v-else-if="section.key === 'reviews'"
        :parent-path="`/media/${mediaId}`"
        :items="section.items"
        @refresh="refreshReviews"
      />
      <p v-else-if="section.items.length === 0">Nenhum registro encontrado.</p>
      <template v-else>
        <RoutableEntitySummaryCard
          v-for="related in section.items"
          :key="String(related.id)"
          :item="related"
          :title-fields="['title', 'name', 'text', 'size_tag', 'id']"
        />
      </template>
    </section>
  </main>
</template>

<style scoped lang="scss">
.MediaDetailView {
  display: grid;
  gap: 20px;
  padding: 24px;

  &-Actions,
  &-Comments,
  &-Section {
    display: grid;
    gap: 12px;
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
