<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import RoutableEntitySummaryCard from '@/components/common/RoutableEntitySummaryCard.vue'
import { findResource } from '@/services/api/resources'
import { getResource } from '@/services/api/resources.api'
import * as InformationApi from '@/services/api/information.api'
import * as SocialApi from '@/services/api/social.api'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'

type RelationSectionConfig = {
  key: string
  label: string
  titleFields: string[]
}

type RelationSection = RelationSectionConfig & {
  items: EntityRow[]
  error: string | null
}

type SummaryVariant = 'auto' | 'path-point' | 'rolling-stock'

const route = useRoute()
const item = ref<EntityRow | null>(null)
const relatedItems = ref<EntityRow[]>([])
const relationSections = ref<RelationSection[]>([])
const commentText = ref('')
const effectFieldName = ref('')
const effectOldValue = ref('')
const effectNewValue = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)
const auth = useAuthStore()

const resource = computed(() => findResource(String(route.params.resource)))
const parentPath = computed(() =>
  resource.value && route.params.id ? `${resource.value.path}/${String(route.params.id)}` : null
)
const supportsComments = computed(() => ['media', 'albums'].includes(String(resource.value?.key)))
const supportsReactions = computed(() =>
  ['media', 'albums', 'comments'].includes(String(resource.value?.key))
)
const supportsInformationContributions = computed(() => resource.value?.key === 'information')
const relationConfigs = computed(
  () => resourceRelationConfigs[String(resource.value?.key ?? '')] ?? []
)

const resourceRelationConfigs: Record<string, RelationSectionConfig[]> = {
  companies: [
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] },
    { key: 'paint-schemes', label: 'Pinturas', titleFields: ['name', 'status', 'id'] }
  ],
  manufacturers: [
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] }
  ],
  locations: [
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] },
    { key: 'paths', label: 'Linhas', titleFields: ['name', 'code', 'path_id', 'id'] },
    { key: 'track-gauges', label: 'Bitolas', titleFields: ['name', 'code', 'gauge_id', 'id'] }
  ],
  paths: [
    { key: 'locations', label: 'Locais', titleFields: ['name', 'code', 'location_id', 'id'] },
    {
      key: 'points',
      label: 'Pontos da linha',
      titleFields: ['order', 'latitude', 'longitude', 'id']
    }
  ],
  routes: [
    { key: 'sections', label: 'Seções', titleFields: ['name', 'status', 'id'] },
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] }
  ],
  'rolling-stock': [
    { key: 'media', label: 'Mídia', titleFields: ['title', 'description', 'media_id', 'id'] },
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] },
    { key: 'freight-car', label: 'Vagão de carga', titleFields: ['number', 'prefix', 'id'] },
    {
      key: 'passenger-car',
      label: 'Carro de passageiros',
      titleFields: ['number', 'prefix', 'id']
    },
    { key: 'non-revenue-car', label: 'Veículo de serviço', titleFields: ['number', 'prefix', 'id'] }
  ],
  'paint-schemes': [
    { key: 'information', label: 'Informações', titleFields: ['title', 'content', 'id'] }
  ],
  states: [{ key: 'cities', label: 'Cidades', titleFields: ['name', 'ibge_id', 'id'] }],
  'track-gauges': [
    { key: 'locations', label: 'Locais', titleFields: ['name', 'code', 'location_id', 'id'] }
  ],
  'locomotive-designs': [
    { key: 'gauges', label: 'Bitolas', titleFields: ['code', 'size', 'gauge_id', 'id'] }
  ],
  information: [
    {
      key: 'effects',
      label: 'Propostas de alteração',
      titleFields: ['field_name', 'old_value', 'new_value', 'id']
    }
  ]
}

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
  if (!parentPath.value) {
    relatedItems.value = []
    relationSections.value = []
    return
  }

  if (supportsComments.value) {
    const response = await SocialApi.listNested(parentPath.value, 'comments')
    relatedItems.value = response.items
  } else {
    relatedItems.value = []
  }

  relationSections.value = await Promise.all(
    relationConfigs.value.map(async (config) => {
      try {
        const response = await SocialApi.listNested(parentPath.value as string, config.key)

        return { ...config, items: response.items, error: null }
      } catch (error) {
        return {
          ...config,
          items: [],
          error:
            error instanceof Error ? error.message : `Não foi possível carregar ${config.label}.`
        }
      }
    })
  )
}

async function createComment() {
  if (!parentPath.value || !commentText.value.trim()) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await SocialApi.createNestedComment(parentPath.value, commentText.value.trim())
    commentText.value = ''
    actionMessage.value = 'Comentário publicado.'
    await loadRelatedItems()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível publicar o comentário.'
  }
}

async function createRelation(relation: string) {
  if (!parentPath.value) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await SocialApi.createNested(parentPath.value, relation)
    actionMessage.value = relation === 'likes' ? 'Curtido.' : 'Favoritado.'
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível registrar a ação.'
  }
}

async function createInformationEffect() {
  if (!route.params.id || !effectFieldName.value.trim() || !effectNewValue.value.trim()) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await InformationApi.createInformationEffect(String(route.params.id), {
      field_name: effectFieldName.value.trim(),
      old_value: effectOldValue.value.trim() || null,
      new_value: effectNewValue.value.trim()
    })
    effectFieldName.value = ''
    effectOldValue.value = ''
    effectNewValue.value = ''
    actionMessage.value = 'Proposta enviada.'
    await loadRelatedItems()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível enviar a proposta.'
  }
}

async function voteOnInformation(value: -1 | 0 | 1) {
  if (!route.params.id) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await InformationApi.createInformationVote(String(route.params.id), value)
    actionMessage.value = 'Voto registrado.'
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível registrar o voto.'
  }
}

function summaryVariant(sectionKey: string): SummaryVariant {
  if (sectionKey === 'points') {
    return 'path-point'
  }

  if (['freight-car', 'passenger-car', 'non-revenue-car'].includes(sectionKey)) {
    return 'rolling-stock'
  }

  return 'auto'
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

    <p v-if="actionMessage">{{ actionMessage }}</p>
    <p v-if="actionErrorMessage">{{ actionErrorMessage }}</p>

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

    <section v-if="item && supportsInformationContributions" class="ResourceDetailView-Relation">
      <h2>Contribuições</h2>
      <template v-if="auth.isLoggedIn">
        <div class="ResourceDetailView-Votes">
          <button type="button" @click="voteOnInformation(1)">Concordo</button>
          <button type="button" @click="voteOnInformation(0)">Neutro</button>
          <button type="button" @click="voteOnInformation(-1)">Discordo</button>
        </div>

        <form class="ResourceDetailView-EffectForm" @submit.prevent="createInformationEffect">
          <label>
            Campo
            <input v-model="effectFieldName" placeholder="field_name" />
          </label>
          <label>
            Valor atual
            <input v-model="effectOldValue" placeholder="Opcional" />
          </label>
          <label>
            Valor proposto
            <input v-model="effectNewValue" />
          </label>
          <button type="submit">Propor alteração</button>
        </form>
      </template>
      <RouterLink v-else to="/login">Entre para votar ou propor alterações</RouterLink>
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

    <section
      v-for="section in relationSections"
      :key="section.key"
      class="ResourceDetailView-Relation"
    >
      <h2>{{ section.label }}</h2>
      <p v-if="section.error">{{ section.error }}</p>
      <p v-else-if="section.items.length === 0">Nenhum registro encontrado.</p>
      <template v-else-if="resource?.key === 'routes' && section.key === 'sections'">
        <RouterLink
          v-for="related in section.items"
          :key="String(related.id)"
          :to="{
            name: 'route-section-detail',
            params: { routeId: String(route.params.id), sectionId: String(related.id) }
          }"
        >
          <EntityCard :item="related" :title-fields="section.titleFields" />
        </RouterLink>
      </template>
      <template v-else>
        <RoutableEntitySummaryCard
          v-for="related in section.items"
          :key="String(related.id)"
          :item="related"
          :title-fields="section.titleFields"
          :variant="summaryVariant(section.key)"
        />
      </template>
    </section>
  </main>
</template>

<style scoped lang="scss">
.ResourceDetailView {
  padding: 24px;

  &-Actions,
  &-Comments,
  &-Relation {
    display: grid;
    gap: 12px;
    margin-top: 24px;
  }

  textarea {
    width: 100%;
    min-height: 90px;
  }

  &-EffectForm,
  &-Votes {
    display: grid;
    gap: 8px;
  }
}
</style>
