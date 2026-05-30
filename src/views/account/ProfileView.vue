<script setup lang="ts">
import { onMounted, ref } from 'vue'

import EntityCard from '@/components/common/EntityCard.vue'
import { useAuthStore } from '@/stores/auth.store'
import type { ProfileUpdatePayload } from '@/types/domain/user.type'

const auth = useAuthStore()
const message = ref<string | null>(null)
const form = ref<Partial<ProfileUpdatePayload>>({})

const profileFields: Array<keyof ProfileUpdatePayload> = [
  'name',
  'cpf',
  'birth_date',
  'address',
  'number',
  'complement',
  'zipcode',
  'phone',
  'city_id',
  'state_id'
]

function hydrateForm() {
  form.value = Object.fromEntries(
    profileFields.map((field) => [field, auth.user?.[field] ? String(auth.user[field]) : ''])
  ) as Partial<ProfileUpdatePayload>
}

async function saveProfile() {
  message.value = null
  const payload = Object.fromEntries(
    Object.entries(form.value).filter(([, value]) => value !== undefined)
  ) as Partial<ProfileUpdatePayload>

  await auth.updateProfile(payload)
  hydrateForm()
  message.value = 'Perfil atualizado.'
}

async function resendEmailValidation() {
  message.value = null
  const response = await auth.resendEmailValidation()
  message.value = String(response.message ?? 'E-mail de validação reenviado.')
}

onMounted(async () => {
  await auth.refreshMe()
  hydrateForm()
})
</script>

<template>
  <main class="ProfileView">
    <h1>Meu Perfil</h1>
    <p v-if="auth.isLoading">Carregando...</p>
    <p v-else-if="auth.errorMessage">{{ auth.errorMessage }}</p>
    <EntityCard
      v-else-if="auth.user"
      :item="auth.user"
      :title-fields="['name', 'username', 'email']"
    />
    <p v-if="message">{{ message }}</p>

    <form v-if="auth.user" class="ProfileView-Form" @submit.prevent="saveProfile">
      <label v-for="field in profileFields" :key="field">
        {{ field }}
        <input v-model="form[field]" />
      </label>
      <button type="submit" :disabled="auth.isLoading">Salvar perfil</button>
      <button type="button" :disabled="auth.isLoading" @click="resendEmailValidation">
        Reenviar validação de e-mail
      </button>
    </form>
  </main>
</template>

<style scoped lang="scss">
.ProfileView {
  padding: 24px;

  &-Form {
    display: grid;
    gap: 12px;
    margin-top: 24px;
  }
}
</style>
