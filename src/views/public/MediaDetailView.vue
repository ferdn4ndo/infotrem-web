<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppField from '@/components/common/AppField.vue'
import AppTextarea from '@/components/common/AppTextarea.vue'
import CommentSection from '@/components/common/CommentSection.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import RelationManager from '@/components/common/RelationManager.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import {
  MEDIA_FALLBACK_LOGO_URL,
  createMediaDownload,
  getMediaDetail,
  getMedia,
  isVideoMedia,
  listMediaRelation,
  mediaPreviewUrl,
  mediaRawUrl,
  toFallbackImage
} from '@/services/api/media.api'
import {
  createNested,
  createNestedComment,
  deleteSocialRelation,
  getSocialSummary,
  type SocialSummary
} from '@/services/api/social.api'
import { findResource, type RelationConfig } from '@/services/api/resources'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'
import type { MediaRow } from '@/types/domain/media.type'

type RelationSection = {
  key: string
  label: string
  detailKey: string
  items: EntityRow[]
  error: string | null
}

const route = useRoute()
const auth = useAuthStore()
const item = ref<MediaRow | null>(null)
const socialSummary = ref<SocialSummary | null>(null)
const relationSections = ref<RelationSection[]>([])
const commentText = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)
const rawHref = ref<string | null>(null)
let activeRequestId = 0

const mediaId = computed(() => String(route.params.id ?? ''))
const storageId = computed(() => stringField(item.value, 'filemgr_storage_id'))
const fileId = computed(() => stringField(item.value, 'filemgr_file_id'))
const canDownload = computed(() => Boolean(storageId.value && fileId.value))
const mediaResource = computed(() => findResource('media'))
const mediaOwnerId = computed(() => stringField(item.value, 'created_by_id'))
const canManageOwnedMediaWrites = computed(() => {
  const currentUserId = String(auth.user?.id ?? '')
  if (!currentUserId) {
    return false
  }
  return (
    auth.isStaff ||
    auth.isAdmin ||
    (mediaOwnerId.value !== null && mediaOwnerId.value === currentUserId)
  )
})
const relationByKey = computed<Record<string, RelationConfig>>(() =>
  Object.fromEntries(
    (mediaResource.value?.relations ?? []).map((relation) => [relation.key, relation])
  )
)
const managedAssetRelations = computed(() =>
  ['images', 'videos', 'documents']
    .map((key) => relationByKey.value[key])
    .filter((relation): relation is RelationConfig => Boolean(relation))
)
const mediaReviewsRelation = computed(() => relationByKey.value.reviews ?? null)
const mediaAlbumsRelation = computed(() => relationByKey.value.albums ?? null)
const mediaRollingStockRelation = computed(() => relationByKey.value['rolling-stock'] ?? null)
const visibleRelationSections = computed(() =>
  relationSections.value.filter((section) => !['albums', 'reviews'].includes(section.key))
)
const previewIsVideo = computed(() => (item.value ? isVideoMedia(item.value) : false))
const previewUrl = computed(() => {
  if (!item.value) {
    return MEDIA_FALLBACK_LOGO_URL
  }

  if (previewIsVideo.value) {
    return (
      stringField(item.value, 'original_url') ??
      stringField(item.value, 'media_url') ??
      MEDIA_FALLBACK_LOGO_URL
    )
  }

  return mediaPreviewUrl(item.value)
})

const relationConfigs = [
  { key: 'image-sizes', detailKey: 'image_sizes', label: 'Tamanhos de imagem' },
  { key: 'comments', detailKey: 'comments', label: 'Comentários' }
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

    return { key, detailKey: key.replace(/-/g, '_'), label, items: response.items, error: null }
  } catch (error) {
    return {
      key,
      label,
      detailKey: key.replace(/-/g, '_'),
      items: [],
      error: error instanceof Error ? error.message : `Não foi possível carregar ${label}.`
    }
  }
}

function toRelationItems(detail: EntityRow, detailKey: string): EntityRow[] {
  const raw = detail[detailKey] ?? detail[detailKey.replace(/_/g, '-')]
  if (Array.isArray(raw)) {
    return raw as EntityRow[]
  }
  if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: EntityRow[] }).items)) {
    return (raw as { items: EntityRow[] }).items
  }
  return []
}

function mapAggregateSections(detail: EntityRow): RelationSection[] {
  return relationConfigs.map((config) => ({
    key: config.key,
    detailKey: config.detailKey,
    label: config.label,
    items: toRelationItems(detail, config.detailKey),
    error: null
  }))
}

async function loadMediaFallback(requestId: number, isCancelled: () => boolean) {
  const loadedItem = await getMedia(mediaId.value)
  if (isCancelled() || requestId !== activeRequestId) {
    return
  }
  item.value = loadedItem

  const loadedSocialSummary = await getSocialSummary(`/media/${mediaId.value}`)
  if (isCancelled() || requestId !== activeRequestId) {
    return
  }
  socialSummary.value = loadedSocialSummary

  const loadedRelationSections = await Promise.all(
    relationConfigs.map((config) => loadRelation(config.key, config.label))
  )
  if (isCancelled() || requestId !== activeRequestId) {
    return
  }
  relationSections.value = loadedRelationSections
}

async function loadMedia(requestId: number, isCancelled: () => boolean) {
  if (!mediaId.value) {
    if (requestId === activeRequestId) {
      item.value = null
      socialSummary.value = null
      relationSections.value = []
      errorMessage.value = null
      isLoading.value = false
    }
    return
  }

  isLoading.value = true
  errorMessage.value = null
  actionMessage.value = null
  actionErrorMessage.value = null
  rawHref.value = null

  try {
    const detail = (await getMediaDetail(mediaId.value)) as EntityRow
    if (isCancelled() || requestId !== activeRequestId) {
      return
    }
    item.value = (detail.media as MediaRow | undefined) ?? (detail as MediaRow)
    socialSummary.value = (detail.social_summary as SocialSummary | null | undefined) ?? null
    relationSections.value = mapAggregateSections(detail)
  } catch (error) {
    console.warn(
      '[MediaDetailView] Failed to load /media/:id/detail; falling back to per-relation requests.',
      error
    )
    try {
      await loadMediaFallback(requestId, isCancelled)
    } catch (fallbackError) {
      if (isCancelled() || requestId !== activeRequestId) {
        return
      }
      errorMessage.value =
        fallbackError instanceof Error ? fallbackError.message : 'Não foi possível carregar mídia.'
    }
  } finally {
    if (requestId === activeRequestId) {
      isLoading.value = false
    }
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

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
    if (requestId === activeRequestId) {
      isLoading.value = false
    }
  })

  void loadMedia(requestId, () => cancelled)
})
</script>

<template>
  <section class="MediaDetailView">
    <RouterLink :to="{ name: 'media-list' }">Voltar para mídia</RouterLink>

    <h1>{{ item?.title ?? item?.name ?? 'Mídia' }}</h1>

    <StatusMessage v-if="isLoading" state="loading" message="Carregando mídia..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />

    <AppCard v-if="item">
      <EntityCard
        :item="item"
        :title-fields="['title', 'name', 'description', 'id']"
        :detail-fields="['status', 'type', 'original_url', 'references', 'location_id']"
      />
    </AppCard>

    <section v-if="item" class="MediaDetailView-Preview">
      <h2>Pré-visualização</h2>
      <video
        v-if="previewIsVideo"
        class="MediaDetailView-PreviewMedia"
        :src="previewUrl"
        controls
        preload="metadata"
      >
        Seu navegador não suporta vídeo HTML5.
      </video>
      <img
        v-else
        class="MediaDetailView-PreviewMedia"
        :src="previewUrl"
        :alt="String(item.title ?? item.name ?? 'Pré-visualização de mídia')"
        @error="toFallbackImage"
      />
    </section>

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
      <AppButton
        v-if="auth.isLoggedIn"
        type="button"
        data-cy="media-like"
        @click="socialSummary?.liked ? deleteRelation('likes') : createRelation('likes')"
      >
        {{ socialSummary?.liked ? 'Remover curtida' : 'Curtir' }}
      </AppButton>
      <AppButton
        v-if="auth.isLoggedIn"
        type="button"
        data-cy="media-favorite"
        @click="
          socialSummary?.favorited ? deleteRelation('favorites') : createRelation('favorites')
        "
      >
        {{ socialSummary?.favorited ? 'Remover favorito' : 'Favoritar' }}
      </AppButton>
      <AppButton
        v-if="auth.isLoggedIn && canDownload"
        type="button"
        data-cy="media-download"
        @click="prepareDownload"
      >
        Preparar download
      </AppButton>
      <a v-if="rawHref" :href="rawHref" target="_blank" rel="noreferrer">Abrir arquivo</a>
      <RouterLink v-if="auth.isLoggedIn" to="/upload/media">Enviar arquivo</RouterLink>
      <RouterLink v-else to="/login">Entre para interagir</RouterLink>
    </section>

    <StatusMessage v-if="actionMessage" state="empty" :message="actionMessage" />
    <StatusMessage v-if="actionErrorMessage" state="error" :message="actionErrorMessage" />

    <section v-if="item" class="MediaDetailView-Comments">
      <h2>Novo comentário</h2>
      <form v-if="auth.isLoggedIn" data-cy="media-comment-form" @submit.prevent="createComment">
        <AppField label="Comentário">
          <template #default="{ id, required, disabled, ariaInvalid, ariaDescribedby }">
            <AppTextarea
              v-model="commentText"
              :id="id"
              :required="required"
              :disabled="disabled"
              :aria-invalid="ariaInvalid"
              :aria-describedby="ariaDescribedby"
              data-cy="media-comment-text"
              placeholder="Escreva um comentário"
            />
          </template>
        </AppField>
        <AppButton type="submit" data-cy="media-comment-submit">Comentar</AppButton>
      </form>
      <RouterLink v-else to="/login">Entre para comentar</RouterLink>
    </section>

    <section
      v-for="section in visibleRelationSections"
      :key="section.key"
      class="MediaDetailView-Section"
    >
      <h2>{{ section.label }}</h2>
      <StatusMessage v-if="section.error" state="error" :message="section.error" />
      <CommentSection
        v-else-if="section.key === 'comments'"
        :parent-path="`/media/${mediaId}`"
        :items="section.items"
        @refresh="refreshComments"
      />
      <EmptyState
        v-else-if="section.items.length === 0"
        title="Nenhum registro encontrado"
        description="Não há itens relacionados nesta seção."
      />
      <template v-else>
        <RoutableEntitySummaryCard
          v-for="related in section.items"
          :key="String(related.id)"
          :item="related"
          :title-fields="['title', 'name', 'text', 'size_tag', 'id']"
        />
      </template>
    </section>

    <template v-if="mediaResource">
      <RelationManager
        v-for="relation in managedAssetRelations"
        :key="relation.key"
        :relation="relation"
        :parent-resource="mediaResource"
        :parent-id="mediaId"
        :owner-id="mediaOwnerId"
        :can-manage="canManageOwnedMediaWrites"
      />

      <RelationManager
        v-if="mediaReviewsRelation"
        :relation="mediaReviewsRelation"
        :parent-resource="mediaResource"
        :parent-id="mediaId"
        :owner-id="mediaOwnerId"
        :can-manage="canManageOwnedMediaWrites"
      />

      <RelationManager
        v-if="mediaRollingStockRelation"
        :relation="mediaRollingStockRelation"
        :parent-resource="mediaResource"
        :parent-id="mediaId"
      />

      <RelationManager
        v-if="mediaAlbumsRelation"
        :relation="mediaAlbumsRelation"
        :parent-resource="mediaResource"
        :parent-id="mediaId"
        :can-manage="false"
      />
    </template>
  </section>
</template>

<style scoped lang="scss">
.MediaDetailView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-5);
  padding: var(--space-4);

  &-Actions,
  &-Preview,
  &-Comments,
  &-Section {
    display: grid;
    gap: var(--space-3);
  }

  form {
    display: grid;
    gap: var(--space-2);
  }

  textarea {
    width: 100%;
    min-height: 90px;
  }

  &-PreviewMedia {
    width: 100%;
    max-height: 70vh;
    border-radius: $radius-md;
    border: 1px solid var(--color-border);
    background: var(--color-background-soft);
    object-fit: contain;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
