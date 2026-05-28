<script setup lang="ts">
import { ref } from 'vue'

import * as MediaApi from '@/services/api/media.api'

const mediaId = ref('')
const storageId = ref('')
const sourceUrl = ref('')
const file = ref<File | null>(null)
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
}

async function uploadFile() {
  if (!file.value) {
    errorMessage.value = 'Selecione um arquivo.'
    return
  }

  message.value = null
  errorMessage.value = null

  try {
    await MediaApi.uploadMediaFile(mediaId.value, storageId.value, file.value)
    message.value = 'Arquivo enviado.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha no envio.'
  }
}

async function uploadUrl() {
  message.value = null
  errorMessage.value = null

  try {
    await MediaApi.uploadMediaFromUrl(mediaId.value, storageId.value, { url: sourceUrl.value })
    message.value = 'URL enviada para processamento.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha no envio da URL.'
  }
}
</script>

<template>
  <main class="MediaUploadView">
    <h1>Enviar mídia</h1>
    <p>Informe o ID da mídia e do storage FileMgr para anexar arquivos a um registro existente.</p>

    <section class="MediaUploadView-Form">
      <label>
        Media ID
        <input v-model="mediaId" required />
      </label>
      <label>
        Storage ID
        <input v-model="storageId" required />
      </label>

      <form @submit.prevent="uploadFile">
        <label>
          Arquivo
          <input type="file" @change="onFileChange" />
        </label>
        <button type="submit">Enviar arquivo</button>
      </form>

      <form @submit.prevent="uploadUrl">
        <label>
          URL
          <input v-model="sourceUrl" type="url" />
        </label>
        <button type="submit">Enviar URL</button>
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
}
</style>
