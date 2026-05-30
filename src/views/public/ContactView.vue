<script setup lang="ts">
import { ref } from 'vue'

import { submitContact, type ContactPayload } from '@/services/api/contact.api'

const form = ref<ContactPayload>({
  type: 'contact',
  name: '',
  email: '',
  phone: '',
  message: ''
})
const isLoading = ref(false)
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

function compactPayload(payload: ContactPayload): ContactPayload {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  ) as ContactPayload
}

async function sendContact() {
  isLoading.value = true
  message.value = null
  errorMessage.value = null

  try {
    await submitContact(compactPayload(form.value))
    form.value.message = ''
    message.value = 'Mensagem enviada.'
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="ContactView">
    <h1>Contato</h1>
    <p>
      Envie dúvidas, correções ou solicitações para a equipe InfoTrem. Sua conta autenticada será
      associada automaticamente à mensagem.
    </p>

    <p v-if="message">{{ message }}</p>
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <form class="ContactView-Form" data-cy="contact-form" @submit.prevent="sendContact">
      <label>
        Tipo
        <input v-model="form.type" placeholder="contact" />
      </label>
      <label>
        Nome
        <input v-model="form.name" />
      </label>
      <label>
        E-mail
        <input v-model="form.email" type="email" />
      </label>
      <label>
        Telefone
        <input v-model="form.phone" />
      </label>
      <label>
        Mensagem
        <textarea v-model="form.message" data-cy="contact-message" required />
      </label>
      <button type="submit" data-cy="contact-submit" :disabled="isLoading">Enviar</button>
    </form>
  </main>
</template>

<style scoped lang="scss">
.ContactView {
  display: grid;
  gap: 16px;
  padding: 24px;

  &-Form {
    display: grid;
    gap: 12px;
  }

  textarea {
    min-height: 140px;
  }
}
</style>
