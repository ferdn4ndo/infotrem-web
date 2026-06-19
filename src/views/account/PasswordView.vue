<script setup lang="ts">
import { ref } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppField from '@/components/common/AppField.vue'
import AppInput from '@/components/common/AppInput.vue'
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
        <AppField label="Senha atual" required>
          <template #default="{ id, required, ariaInvalid, ariaDescribedby }">
            <AppInput
              v-model="currentPassword"
              :id="id"
              type="password"
              autocomplete="current-password"
              :required="required"
              :aria-invalid="ariaInvalid"
              :aria-describedby="ariaDescribedby"
              data-cy="password-current"
            />
          </template>
        </AppField>
        <AppField label="Nova senha" required>
          <template #default="{ id, required, ariaInvalid, ariaDescribedby }">
            <AppInput
              v-model="newPassword"
              :id="id"
              type="password"
              autocomplete="new-password"
              :required="required"
              :aria-invalid="ariaInvalid"
              :aria-describedby="ariaDescribedby"
              data-cy="password-new"
            />
          </template>
        </AppField>
        <AppButton type="submit" data-cy="password-submit">Salvar</AppButton>
        <StatusMessage v-if="message" state="empty" :message="message" />
        <StatusMessage v-if="errorMessage" state="error" :message="errorMessage" />
      </form>
    </AppCard>
  </main>
</template>

<style scoped lang="scss">
.PasswordView {
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
