<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import CommentSection from '@/components/common/CommentSection.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import { getAlbum } from '@/services/api/albums.api'
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

const albumId = computed(() => String(route.params.id ?? ''))

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

async function loadAlbum() {
  if (!albumId.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = null
  actionMessage.value = null
  actionErrorMessage.value = null

  try {
    item.value = await getAlbum(albumId.value)
    socialSummary.value = await getSocialSummary(`/albums/${albumId.value}`)
    relationSections.value = await Promise.all(
      relationConfigs.map((config) => loadRelation(config.key, config.label))
    )
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Não foi possível carregar álbum.'
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

watchEffect(loadAlbum)
</script>

<template>
  <main class="AlbumDetailView">
    <RouterLink :to="{ name: 'album-list' }">Voltar para álbuns</RouterLink>

    <h1>{{ item?.title ?? 'Álbum' }}</h1>
    <p v-if="isLoading">Carregando álbum...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <EntityCard
      v-if="item"
      :item="item"
      :title-fields="['title', 'description', 'id']"
      :detail-fields="['status', 'created_at', 'updated_at']"
    />

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

    <p v-if="actionMessage">{{ actionMessage }}</p>
    <p v-if="actionErrorMessage">{{ actionErrorMessage }}</p>

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
      <p v-if="section.error">{{ section.error }}</p>
      <CommentSection
        v-else-if="section.key === 'comments'"
        :parent-path="`/albums/${albumId}`"
        :items="section.items"
        @refresh="refreshComments"
      />
      <p v-else-if="section.items.length === 0">Nenhum registro encontrado.</p>
      <template v-else>
        <RoutableEntitySummaryCard
          v-for="related in section.items"
          :key="String(related.id)"
          :item="related"
          :title-fields="['title', 'name', 'text', 'media_id', 'id']"
        />
      </template>
    </section>
  </main>
</template>

<style scoped lang="scss">
.AlbumDetailView {
  display: grid;
  gap: 20px;
  padding: 24px;

  &-Section {
    display: grid;
    gap: 12px;
  }

  textarea {
    width: 100%;
    min-height: 90px;
  }
}
</style>
