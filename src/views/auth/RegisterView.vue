<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const username = ref('')
const name = ref('')
const password = ref('')
const successMessage = ref<string | null>(null)

async function submitRegister() {
  try {
    await auth.register({
      email: email.value,
      username: username.value || undefined,
      name: name.value || undefined,
      password: password.value
    })
    successMessage.value = auth.isLoggedIn
      ? 'Cadastro criado. Você já está autenticado.'
      : 'Cadastro criado. Faça login para continuar.'
    await router.push({ name: auth.isLoggedIn ? 'me' : 'login' })
  } catch {
    // auth.register surfaces auth.errorMessage and re-throws; catch here to avoid unhandled promises.
  }
}
</script>

<template>
  <main class="AuthView">
    <h1>Criar conta</h1>
    <AppCard>
      <form class="AuthView-Form" @submit.prevent="submitRegister">
        <label>
          Nome
          <input v-model="name" autocomplete="name" />
        </label>
        <label>
          Usuário
          <input v-model="username" autocomplete="username" />
        </label>
        <label>
          E-mail
          <input v-model="email" type="email" autocomplete="email" required />
        </label>
        <label>
          Senha
          <input v-model="password" type="password" autocomplete="new-password" required />
        </label>
        <button type="submit" :disabled="auth.isLoading">Cadastrar</button>
        <StatusMessage
          v-if="auth.isLoading"
          state="loading"
          message="Criando conta e preparando seu acesso..."
        />
        <StatusMessage v-if="successMessage" state="empty" :message="successMessage" />
        <StatusMessage v-if="auth.errorMessage" state="error" :message="auth.errorMessage" />
      </form>
    </AppCard>
  </main>
</template>

<style scoped lang="scss">
.AuthView {
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
