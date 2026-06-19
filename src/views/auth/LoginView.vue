<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const email = ref('')
const password = ref('')

async function submitLogin() {
  try {
    await auth.login({ email: email.value, password: password.value })
    await router.push(String(route.query.redirect ?? '') || { name: 'me' })
  } catch {
    // auth.login surfaces auth.errorMessage and re-throws; catch here to avoid unhandled promises.
  }
}
</script>

<template>
  <main class="AuthView">
    <h1>Entrar</h1>
    <AppCard>
      <form class="AuthView-Form" data-cy="login-form" @submit.prevent="submitLogin">
        <label>
          E-mail
          <input v-model="email" data-cy="login-email" type="email" autocomplete="email" required />
        </label>
        <label>
          Senha
          <input
            v-model="password"
            data-cy="login-password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>
        <button type="submit" data-cy="login-submit" :disabled="auth.isLoading">Entrar</button>
        <StatusMessage v-if="auth.isLoading" state="loading" message="Entrando..." />
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
