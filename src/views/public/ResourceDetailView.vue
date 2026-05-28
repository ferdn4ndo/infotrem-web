<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import { findResource } from '@/services/api/resources'
import { getResource } from '@/services/api/resources.api'
import * as SocialApi from '@/services/api/social.api'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()
const item = ref<EntityRow | null>(null)
const relatedItems = ref<EntityRow[]>([])
const commentText = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const auth = useAuthStore()

const resource = computed(() => findResource(String(route.params.resource)))
const parentPath = computed(() =>
  resource.value && route.params.id ? `${resource.value.path}/${String(route.params.id)}` : null
)
const supportsComments = computed(() => ['media', 'albums'].includes(String(resource.value?.key)))
const supportsReactions = computed(() =>
  ['media', 'albums', 'comments'].includes(String(resource.value?.key))
)

watchEffect(async () => {
  if (!resource.value || !route.params.id) {
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    item.value = await getResource(resource.value.path, String(route.params.id))
    await loadRelatedItems()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o registro.'
  } finally {
    isLoading.value = false
  }
})

async function loadRelatedItems() {
  if (!parentPath.value || !supportsComments.value) {
    relatedItems.value = []
    return
  }

  const response = await SocialApi.listNested(parentPath.value, 'comments')
  relatedItems.value = response.items
}

async function createComment() {
  if (!parentPath.value || !commentText.value.trim()) {
    return
  }

  await SocialApi.createNested(parentPath.value, 'comments', { text: commentText.value.trim() })
  commentText.value = ''
  await loadRelatedItems()
}

async function createRelation(relation: string) {
  if (!parentPath.value) {
    return
  }

  await SocialApi.createNested(parentPath.value, relation)
}
</script>

<template>
  <main class="ResourceDetailView">
    <h1>{{ resource?.label ?? 'Recurso não encontrado' }}</h1>

    <p v-if="isLoading">Carregando...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="!resource">Este recurso ainda não está configurado no frontend.</p>
    <EntityCard
      v-else-if="item"
      :item="item"
      :title-fields="resource.primaryFields"
      :detail-fields="resource.detailFields"
    />

    <section v-if="item && supportsReactions" class="ResourceDetailView-Actions">
      <h2>Ações</h2>
      <button v-if="auth.isLoggedIn" type="button" @click="createRelation('likes')">Curtir</button>
      <button
        v-if="auth.isLoggedIn && resource?.key !== 'comments'"
        type="button"
        @click="createRelation('favorites')"
      >
        Favoritar
      </button>
      <RouterLink v-if="auth.isLoggedIn && resource?.key === 'media'" to="/upload/media">
        Enviar arquivo
      </RouterLink>
      <RouterLink v-if="!auth.isLoggedIn" to="/login">Entre para interagir</RouterLink>
    </section>

    <section v-if="supportsComments" class="ResourceDetailView-Comments">
      <h2>Comentários</h2>
      <form v-if="auth.isLoggedIn" @submit.prevent="createComment">
        <textarea v-model="commentText" placeholder="Escreva um comentário" />
        <button type="submit">Comentar</button>
      </form>
      <EntityCard
        v-for="related in relatedItems"
        :key="String(related.id)"
        :item="related"
        :title-fields="['text', 'title', 'id']"
      />
    </section>
  </main>
</template>

<style scoped lang="scss">
.ResourceDetailView {
  padding: 24px;

  &-Actions,
  &-Comments {
    display: grid;
    gap: 12px;
    margin-top: 24px;
  }

  textarea {
    width: 100%;
    min-height: 90px;
  }
}
</style>
