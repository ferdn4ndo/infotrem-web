<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppField from '@/components/common/AppField.vue'
import AppInput from '@/components/common/AppInput.vue'
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
        <AppField label="Nome">
          <template #default="{ id }">
            <AppInput v-model="name" :id="id" autocomplete="name" data-cy="register-name" />
          </template>
        </AppField>
        <AppField label="Usuário">
          <template #default="{ id }">
            <AppInput
              v-model="username"
              :id="id"
              autocomplete="username"
              data-cy="register-username"
            />
          </template>
        </AppField>
        <AppField label="E-mail" required>
          <template #default="{ id, required, ariaInvalid, ariaDescribedby }">
            <AppInput
              v-model="email"
              :id="id"
              type="email"
              autocomplete="email"
              :required="required"
              :aria-invalid="ariaInvalid"
              :aria-describedby="ariaDescribedby"
              data-cy="register-email"
            />
          </template>
        </AppField>
        <AppField label="Senha" required>
          <template #default="{ id, required, ariaInvalid, ariaDescribedby }">
            <AppInput
              v-model="password"
              :id="id"
              type="password"
              autocomplete="new-password"
              :required="required"
              :aria-invalid="ariaInvalid"
              :aria-describedby="ariaDescribedby"
              data-cy="register-password"
            />
          </template>
        </AppField>
        <AppButton type="submit" :disabled="auth.isLoading" data-cy="register-submit"
          >Cadastrar</AppButton
        >
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
  max-width: $breakpoint-medium;
  margin: 0 auto;
  padding: var(--space-4);

  &-Form {
    display: grid;
    gap: var(--space-3);
    max-width: min(100%, $breakpoint-small);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
