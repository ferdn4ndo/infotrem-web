<script setup lang="ts">
import { ref } from 'vue'

import AppCard from '@/components/common/AppCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import * as AuthApi from '@/services/api/auth.api'

const currentPassword = ref('')
const newPassword = ref('')
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

async function submitPasswordChange() {
  message.value = null
  errorMessage.value = null

  try {
    await AuthApi.changePassword({
      current_password: currentPassword.value,
      password: newPassword.value,
      new_password: newPassword.value
    })
    message.value = 'Senha alterada.'
    currentPassword.value = ''
    newPassword.value = ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível alterar a senha.'
  }
}
</script>

<template>
  <main class="PasswordView">
    <h1>Alterar senha</h1>
    <AppCard>
      <form class="PasswordView-Form" @submit.prevent="submitPasswordChange">
        <label>
          Senha atual
          <input
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>
        <label>
          Nova senha
          <input v-model="newPassword" type="password" autocomplete="new-password" required />
        </label>
        <button type="submit">Salvar</button>
        <StatusMessage v-if="message" state="empty" :message="message" />
        <StatusMessage v-if="errorMessage" state="error" :message="errorMessage" />
      </form>
    </AppCard>
  </main>
</template>

<style scoped lang="scss">
.PasswordView {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Form {
    display: grid;
    gap: var(--space-3);
    max-width: 420px;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
