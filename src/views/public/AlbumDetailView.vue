<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import CommentSection from '@/components/common/CommentSection.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { getAlbum } from '@/services/api/albums.api'
import {
  MEDIA_FALLBACK_LOGO_URL,
  mediaThumbnailUrl,
  toFallbackImage
} from '@/services/api/media.api'
import {
  createNested,
  createNestedComment,
  deleteSocialRelation,
  getSocialSummary,
  listNested,
  type SocialSummary
} from '@/services/api/social.api'
import { useAuthStore } from '@/stores/auth.store'
import type { AlbumRow } from '@/types/domain/album.type'
import type { EntityRow } from '@/types/domain/common.type'

type RelationSection = {
  key: string
  label: string
  items: EntityRow[]
  error: string | null
}

const route = useRoute()
const auth = useAuthStore()
const item = ref<AlbumRow | null>(null)
const socialSummary = ref<SocialSummary | null>(null)
const relationSections = ref<RelationSection[]>([])
const commentText = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)
let activeRequestId = 0

const albumId = computed(() => String(route.params.id ?? ''))
const coverUrl = computed(() => {
  const media = relationSections.value.find((section) => section.key === 'media')?.items?.[0]
  return media ? mediaThumbnailUrl(media) : MEDIA_FALLBACK_LOGO_URL
})

const relationConfigs = [
  { key: 'media', label: 'Mídia' },
  { key: 'comments', label: 'Comentários' }
]

async function loadRelation(key: string, label: string): Promise<RelationSection> {
  try {
    const response = await listNested(`/albums/${albumId.value}`, key)

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

async function loadAlbum(requestId: number, isCancelled: () => boolean) {
  if (!albumId.value) {
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

  try {
    const loadedItem = await getAlbum(albumId.value)
    if (isCancelled() || requestId !== activeRequestId) {
      if (requestId === activeRequestId) {
        isLoading.value = false
      }
      return
    }
    item.value = loadedItem

    const loadedSocialSummary = await getSocialSummary(`/albums/${albumId.value}`)
    if (isCancelled() || requestId !== activeRequestId) {
      if (requestId === activeRequestId) {
        isLoading.value = false
      }
      return
    }
    socialSummary.value = loadedSocialSummary

    const loadedRelationSections = await Promise.all(
      relationConfigs.map((config) => loadRelation(config.key, config.label))
    )
    if (isCancelled() || requestId !== activeRequestId) {
      if (requestId === activeRequestId) {
        isLoading.value = false
      }
      return
    }
    relationSections.value = loadedRelationSections
  } catch (error) {
    if (isCancelled() || requestId !== activeRequestId) {
      if (requestId === activeRequestId) {
        isLoading.value = false
      }
      return
    }
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar álbum.'
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
    await createNestedComment(`/albums/${albumId.value}`, commentText.value.trim())
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
    await createNested(`/albums/${albumId.value}`, relation)
    socialSummary.value = await getSocialSummary(`/albums/${albumId.value}`)
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
    await deleteSocialRelation(`/albums/${albumId.value}`, relation, relationId)
    socialSummary.value = await getSocialSummary(`/albums/${albumId.value}`)
    actionMessage.value = relation === 'likes' ? 'Curtida removida.' : 'Favorito removido.'
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível remover a ação.'
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

  void loadAlbum(requestId, () => cancelled)
})
</script>

<template>
  <main class="AlbumDetailView">
    <RouterLink :to="{ name: 'album-list' }">Voltar para álbuns</RouterLink>

    <h1>{{ item?.title ?? 'Álbum' }}</h1>
    <StatusMessage v-if="isLoading" state="loading" message="Carregando álbum..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />

    <AppCard v-if="item">
      <EntityCard
        :item="item"
        :title-fields="['title', 'description', 'id']"
        :detail-fields="['status', 'created_at', 'updated_at']"
      />
    </AppCard>

    <section v-if="item" class="AlbumDetailView-Section">
      <h2>Capa do álbum</h2>
      <img
        class="AlbumDetailView-Cover"
        :src="coverUrl"
        :alt="`Capa do álbum ${String(item.title ?? item.id)}`"
        @error="toFallbackImage"
      />
    </section>

    <section v-if="item" class="AlbumDetailView-Section">
      <h2>Ações</h2>
      <p v-if="socialSummary">
        {{ socialSummary.likes_count }} curtidas ·
        {{ socialSummary.favorites_count ?? 0 }} favoritos
      </p>
      <button
        v-if="auth.isLoggedIn"
        type="button"
        data-cy="album-like"
        @click="socialSummary?.liked ? deleteRelation('likes') : createRelation('likes')"
      >
        {{ socialSummary?.liked ? 'Remover curtida' : 'Curtir' }}
      </button>
      <button
        v-if="auth.isLoggedIn"
        type="button"
        data-cy="album-favorite"
        @click="
          socialSummary?.favorited ? deleteRelation('favorites') : createRelation('favorites')
        "
      >
        {{ socialSummary?.favorited ? 'Remover favorito' : 'Favoritar' }}
      </button>
      <RouterLink v-else to="/login">Entre para interagir</RouterLink>
    </section>

    <StatusMessage v-if="actionMessage" state="empty" :message="actionMessage" />
    <StatusMessage v-if="actionErrorMessage" state="error" :message="actionErrorMessage" />

    <section v-if="item" class="AlbumDetailView-Section">
      <h2>Novo comentário</h2>
      <form v-if="auth.isLoggedIn" data-cy="album-comment-form" @submit.prevent="createComment">
        <textarea
          v-model="commentText"
          data-cy="album-comment-text"
          placeholder="Escreva um comentário"
        />
        <button type="submit" data-cy="album-comment-submit">Comentar</button>
      </form>
      <RouterLink v-else to="/login">Entre para comentar</RouterLink>
    </section>

    <section v-for="section in relationSections" :key="section.key" class="AlbumDetailView-Section">
      <h2>{{ section.label }}</h2>
      <StatusMessage v-if="section.error" state="error" :message="section.error" />
      <CommentSection
        v-else-if="section.key === 'comments'"
        :parent-path="`/albums/${albumId}`"
        :items="section.items"
        @refresh="refreshComments"
      />
      <EmptyState
        v-else-if="section.items.length === 0"
        title="Nenhum registro encontrado"
        description="Não há itens relacionados nesta seção."
      />
      <template v-else>
        <article
          v-for="related in section.items"
          :key="String(related.id)"
          class="AlbumDetailView-RelatedItem"
        >
          <img
            v-if="section.key === 'media'"
            class="AlbumDetailView-Thumb"
            :src="mediaThumbnailUrl(related)"
            :alt="String(related.title ?? related.name ?? 'Miniatura de mídia')"
            @error="toFallbackImage"
          />
          <RoutableEntitySummaryCard
            :item="related"
            :title-fields="['title', 'name', 'text', 'media_id', 'id']"
          />
        </article>
      </template>
    </section>
  </main>
</template>

<style scoped lang="scss">
.AlbumDetailView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-5);
  padding: var(--space-4);

  &-Section {
    display: grid;
    gap: var(--space-3);
  }

  &-Cover {
    width: 100%;
    max-height: 360px;
    object-fit: cover;
    border-radius: $radius-md;
    border: 1px solid var(--color-border);
    background: var(--color-background-soft);
  }

  &-RelatedItem {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: minmax(96px, 180px) 1fr;
    align-items: start;
  }

  &-Thumb {
    width: 100%;
    height: 112px;
    object-fit: cover;
    border-radius: $radius-md;
    border: 1px solid var(--color-border);
    background: var(--color-background-soft);
  }

  textarea {
    width: 100%;
    min-height: 90px;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);

    &-RelatedItem {
      grid-template-columns: 1fr;
    }

    &-Thumb {
      max-width: 240px;
      height: 140px;
    }
  }
}
</style>
