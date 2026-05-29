<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const username = ref('')
const name = ref('')
const password = ref('')
const successMessage = ref<string | null>(null)

async function submitRegister() {
  await auth.register({
    email: email.value,
    username: username.value || undefined,
    name: name.value || undefined,
    password: password.value
  })
  successMessage.value = 'Cadastro criado. Faça login para continuar.'
  await router.push({ name: 'login' })
}
</script>

<template>
  <main class="AuthView">
    <h1>Criar conta</h1>
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
      <p v-if="successMessage">{{ successMessage }}</p>
      <p v-if="auth.errorMessage">{{ auth.errorMessage }}</p>
    </form>
  </main>
</template>

<style scoped lang="scss">
.AuthView {
  padding: 24px;

  &-Form {
    display: grid;
    gap: 12px;
    max-width: 420px;
  }
}
</style>
