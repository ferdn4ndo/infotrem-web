<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')

async function submitLogin() {
  await auth.login({ email: email.value, password: password.value })
  await router.push({ name: 'me' })
}
</script>

<template>
  <main class="AuthView">
    <h1>Entrar</h1>
    <form class="AuthView-Form" @submit.prevent="submitLogin">
      <label>
        E-mail
        <input v-model="email" type="email" autocomplete="email" required />
      </label>
      <label>
        Senha
        <input v-model="password" type="password" autocomplete="current-password" required />
      </label>
      <button type="submit" :disabled="auth.isLoading">Entrar</button>
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
