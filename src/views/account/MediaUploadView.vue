<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import * as MediaApi from '@/services/api/media.api'
import type { MediaCreatePayload, MediaRow } from '@/types/domain/media.type'

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
const isCreating = ref(false)
const isUploading = ref(false)

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
          Location ID
          <input v-model="mediaForm.location_id" />
        </label>
        <button type="submit" data-cy="media-create-submit" :disabled="isCreating">
          Criar mídia
        </button>
      </form>

      <p v-if="media">
        Mídia criada:
        <RouterLink :to="{ name: 'media-detail', params: { id: media.id } }">{{
          media.id
        }}</RouterLink>
      </p>

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

      <p v-if="message">{{ message }}</p>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </section>
  </main>
</template>

<style scoped lang="scss">
.MediaUploadView {
  padding: 24px;

  &-Form,
  form {
    display: grid;
    gap: 12px;
    max-width: 520px;
  }

  textarea {
    min-height: 100px;
  }
}
</style>
