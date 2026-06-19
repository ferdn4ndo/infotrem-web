<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { listResource } from '@/services/api/resources.api'
import { listNested } from '@/services/api/social.api'
import { useAuthStore } from '@/stores/auth.store'
import type { ProfileUpdatePayload } from '@/types/domain/user.type'
import type { EntityRow } from '@/types/domain/common.type'

const auth = useAuthStore()
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const form = ref<Partial<ProfileUpdatePayload>>({})
const states = ref<EntityRow[]>([])
const cities = ref<EntityRow[]>([])
const isLoadingLookups = ref(false)
let isHydrating = true

const profileFields: Array<keyof ProfileUpdatePayload> = [
  'name',
  'cpf',
  'birth_date',
  'address',
  'number',
  'complement',
  'zipcode',
  'phone'
]

const profileFieldLabels: Record<keyof ProfileUpdatePayload, string> = {
  name: 'Nome',
  cpf: 'CPF',
  birth_date: 'Data de nascimento',
  address: 'Endereco',
  number: 'Numero',
  complement: 'Complemento',
  zipcode: 'CEP',
  phone: 'Telefone',
  state_id: 'Estado',
  city_id: 'Cidade'
}

function profileFieldLabel(field: keyof ProfileUpdatePayload) {
  return profileFieldLabels[field] ?? String(field)
}

function stringField(row: EntityRow, key: string) {
  const value = row[key]
  return value === null || value === undefined || value === '' ? null : String(value)
}

function stateLabel(state: EntityRow) {
  return (
    stringField(state, 'name') ??
    stringField(state, 'abbrev') ??
    stringField(state, 'ibge_id') ??
    stringField(state, 'id') ??
    'Estado'
  )
}

function cityLabel(city: EntityRow) {
  return (
    stringField(city, 'name') ??
    stringField(city, 'abbrev') ??
    stringField(city, 'ibge_id') ??
    stringField(city, 'id') ??
    'Cidade'
  )
}

function hydrateForm() {
  form.value = Object.fromEntries(
    [...profileFields, 'city_id', 'state_id'].map((field) => [
      field,
      auth.user?.[field] ? String(auth.user[field]) : ''
    ])
  ) as Partial<ProfileUpdatePayload>
}

async function loadStates() {
  try {
    const response = await listResource('/states', { limit: 500 })
    states.value = response.items
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar os estados.'
    throw error
  }
}

async function loadCitiesForState(stateId: string) {
  if (!stateId) {
    cities.value = []
    return
  }

  try {
    const response = await listNested(`/states/${stateId}`, 'cities')
    cities.value = response.items
  } catch (error) {
    console.warn('[ProfileView] Failed to load /states/:id/cities; falling back to /cities.', error)
    const response = await listResource('/cities', { limit: 1000 })
    cities.value = response.items.filter((city) => String(city.state_id ?? '') === stateId)
  }
}

async function saveProfile() {
  message.value = null
  errorMessage.value = null
  const payload = Object.fromEntries(
    Object.entries(form.value).filter(([, value]) => value !== undefined)
  ) as Partial<ProfileUpdatePayload>

  try {
    await auth.updateProfile(payload)
    hydrateForm()
    message.value = 'Perfil atualizado.'
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível atualizar o perfil.'
  }
}

async function resendEmailValidation() {
  message.value = null
  errorMessage.value = null
  try {
    const response = await auth.resendEmailValidation()
    message.value = String(response.message ?? 'E-mail de validação reenviado.')
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível reenviar a validação.'
  }
}

onMounted(async () => {
  await auth.refreshMe()
  hydrateForm()
  isLoadingLookups.value = true
  await loadStates().catch(() => {})
  await loadCitiesForState(String(form.value.state_id ?? '')).catch((error) => {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Não foi possível carregar estados e cidades para o perfil.'
  })
  isLoadingLookups.value = false
  isHydrating = false
})

watch(
  () => String(form.value.state_id ?? ''),
  async (nextStateId, previousStateId) => {
    if (isHydrating || nextStateId === previousStateId) {
      return
    }

    isLoadingLookups.value = true
    try {
      await loadCitiesForState(nextStateId)
      if (
        !cities.value.find((city) => stringField(city, 'id') === String(form.value.city_id ?? ''))
      ) {
        form.value.city_id = ''
      }
    } finally {
      isLoadingLookups.value = false
    }
  }
)
</script>

<template>
  <main class="ProfileView">
    <h1>Meu Perfil</h1>
    <StatusMessage v-if="auth.isLoading" state="loading" message="Carregando perfil..." />
    <StatusMessage v-else-if="auth.errorMessage" state="error" :message="auth.errorMessage" />
    <EmptyState
      v-else-if="!auth.user"
      title="Perfil indisponível"
      description="Não foi possível carregar os dados da sua conta."
    />
    <AppCard v-else>
      <EntityCard :item="auth.user" :title-fields="['name', 'username', 'email']" />
    </AppCard>
    <StatusMessage v-if="message" state="empty" :message="message" />
    <StatusMessage v-if="errorMessage" state="error" :message="errorMessage" />
    <StatusMessage
      v-if="isLoadingLookups"
      state="loading"
      message="Carregando estados e cidades..."
    />

    <form v-if="auth.user" class="ProfileView-Form" @submit.prevent="saveProfile">
      <label v-for="field in profileFields" :key="field">
        {{ profileFieldLabel(field) }}
        <input v-model="form[field]" />
      </label>
      <label>
        Estado
        <select v-model="form.state_id">
          <option value="">Selecione um estado</option>
          <option v-for="state in states" :key="String(state.id)" :value="String(state.id)">
            {{ stateLabel(state) }}
          </option>
        </select>
      </label>
      <label>
        Cidade
        <select v-model="form.city_id" :disabled="!form.state_id">
          <option value="">Selecione uma cidade</option>
          <option v-for="city in cities" :key="String(city.id)" :value="String(city.id)">
            {{ cityLabel(city) }}
          </option>
        </select>
      </label>
      <AppButton type="submit" :disabled="auth.isLoading">Salvar perfil</AppButton>
      <AppButton type="button" :disabled="auth.isLoading" @click="resendEmailValidation">
        Reenviar validação de e-mail
      </AppButton>
    </form>
  </main>
</template>

<style scoped lang="scss">
.ProfileView {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Form {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-5);
    max-width: 560px;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
