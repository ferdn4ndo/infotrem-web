<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import * as MediaApi from '@/services/api/media.api'
import { listResource } from '@/services/api/resources.api'
import type { MediaCreatePayload, MediaRow } from '@/types/domain/media.type'
import type { EntityRow } from '@/types/domain/common.type'

const media = ref<MediaRow | null>(null)
const mediaForm = ref<MediaCreatePayload>({
  title: '',
  description: '',
  type: '',
  status: 'DRAFT',
  original_url: '',
  references: '',
  location_id: ''
})
const sourceUrl = ref('')
const file = ref<File | null>(null)
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const locations = ref<EntityRow[]>([])
const isCreating = ref(false)
const isUploading = ref(false)
const isLoadingLocations = ref(false)

function locationLabel(location: EntityRow) {
  return String(location.name ?? location.code ?? location.id ?? 'Local')
}

async function loadLocations() {
  isLoadingLocations.value = true
  try {
    const response = await listResource('/locations', { limit: 500 })
    locations.value = response.items
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar os locais.'
  } finally {
    isLoadingLocations.value = false
  }
}

function compactMediaPayload(payload: MediaCreatePayload): MediaCreatePayload {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== undefined && value !== '' && value !== null
    )
  ) as MediaCreatePayload
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
}

async function createMedia() {
  message.value = null
  errorMessage.value = null
  isCreating.value = true

  try {
    media.value = await MediaApi.createMedia(compactMediaPayload(mediaForm.value))
    message.value = 'Registro de mídia criado. Agora anexe um arquivo ou URL.'
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível criar o registro de mídia.'
  } finally {
    isCreating.value = false
  }
}

async function uploadFile() {
  if (!file.value) {
    errorMessage.value = 'Selecione um arquivo.'
    return
  }

  if (!media.value?.id) {
    errorMessage.value = 'Crie a mídia antes de enviar.'
    return
  }

  message.value = null
  errorMessage.value = null
  isUploading.value = true

  try {
    await MediaApi.uploadMediaFile(media.value.id, file.value)
    media.value = await MediaApi.getMedia(media.value.id)
    message.value = 'Arquivo enviado.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha no envio.'
  } finally {
    isUploading.value = false
  }
}

async function uploadUrl() {
  if (!media.value?.id || !sourceUrl.value) {
    errorMessage.value = 'Crie a mídia e preencha a URL.'
    return
  }

  message.value = null
  errorMessage.value = null
  isUploading.value = true

  try {
    await MediaApi.uploadMediaFromUrl(media.value.id, {
      url: sourceUrl.value
    })
    media.value = await MediaApi.getMedia(media.value.id)
    message.value = 'URL enviada para processamento.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha no envio da URL.'
  } finally {
    isUploading.value = false
  }
}

onMounted(() => {
  void loadLocations().catch((error) => {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar os locais.'
  })
})
</script>

<template>
  <main class="MediaUploadView">
    <h1>Enviar mídia</h1>
    <p>
      Crie o registro de mídia e depois anexe um arquivo ou URL ao FileMgr. O backend seleciona o
      storage padrão configurado para uploads.
    </p>

    <section class="MediaUploadView-Form">
      <form data-cy="media-create-form" @submit.prevent="createMedia">
        <label>
          Título
          <input v-model="mediaForm.title" data-cy="media-title" required />
        </label>
        <label>
          Descrição
          <textarea v-model="mediaForm.description" />
        </label>
        <label>
          Status
          <input v-model="mediaForm.status" />
        </label>
        <label>
          Tipo
          <input v-model="mediaForm.type" />
        </label>
        <label>
          URL original
          <input v-model="mediaForm.original_url" type="url" />
        </label>
        <label>
          Referências
          <input v-model="mediaForm.references" />
        </label>
        <label>
          Local
          <select v-model="mediaForm.location_id">
            <option value="">Selecione um local</option>
            <option
              v-for="location in locations"
              :key="String(location.id)"
              :value="String(location.id)"
            >
              {{ locationLabel(location) }}
            </option>
          </select>
        </label>
        <button type="submit" data-cy="media-create-submit" :disabled="isCreating">
          Criar mídia
        </button>
      </form>
      <StatusMessage v-if="isLoadingLocations" state="loading" message="Carregando locais..." />

      <StatusMessage
        v-if="isCreating"
        state="loading"
        message="Criando registro de mídia antes do upload..."
      />
      <StatusMessage
        v-if="isUploading"
        state="loading"
        message="Enviando arquivo/URL para processamento..."
      />
      <AppCard v-if="media">
        <p>
          Mídia criada:
          <RouterLink :to="{ name: 'media-detail', params: { id: media.id } }">{{
            media.id
          }}</RouterLink>
        </p>
      </AppCard>
      <EmptyState
        v-else
        title="Nenhuma mídia criada"
        description="Preencha o formulário para iniciar um upload."
      />

      <form data-cy="media-file-upload-form" @submit.prevent="uploadFile">
        <label>
          Arquivo
          <input type="file" @change="onFileChange" />
        </label>
        <button type="submit" :disabled="!media || isUploading">Enviar arquivo</button>
      </form>

      <form data-cy="media-url-upload-form" @submit.prevent="uploadUrl">
        <label>
          URL
          <input v-model="sourceUrl" data-cy="media-source-url" type="url" />
        </label>
        <button type="submit" data-cy="media-url-submit" :disabled="!media || isUploading">
          Enviar URL
        </button>
      </form>

      <StatusMessage v-if="message" state="empty" :message="message" />
      <StatusMessage v-if="errorMessage" state="error" :message="errorMessage" />
    </section>
  </main>
</template>

<style scoped lang="scss">
.MediaUploadView {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Form,
  form {
    display: grid;
    gap: var(--space-3);
    max-width: 520px;
  }

  textarea {
    min-height: 100px;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
