<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import { findResource } from '@/services/api/resources'
import {
  createResource,
  deleteResource,
  listResource,
  updateResource
} from '@/services/api/resources.api'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()
const auth = useAuthStore()
const items = ref<EntityRow[]>([])
const selected = ref<EntityRow | null>(null)
const pendingDelete = ref<EntityRow | null>(null)
const payload = ref('{}')
const formValues = ref<Record<string, string | boolean>>({})
const errorMessage = ref<string | null>(null)
const message = ref<string | null>(null)

const resource = computed(() => findResource(String(route.params.resource)))
const canAccessResource = computed(() => {
  if (!resource.value) {
    return false
  }

  if (resource.value.access === 'admin') {
    return auth.isAdmin
  }

  if (resource.value.access === 'staff') {
    return auth.isStaff
  }

  return auth.isStaff
})
const hasTypedForm = computed(() => Boolean(resource.value?.writeFields?.length))

async function loadItems() {
  if (!resource.value || !canAccessResource.value) {
    return
  }

  const response = await listResource(resource.value.path, { limit: 100 })
  items.value = response.items
}

watchEffect(async () => {
  errorMessage.value = null
  message.value = null

  try {
    await loadItems()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar o recurso.'
  }
})

function selectItem(item: EntityRow) {
  selected.value = item
  payload.value = JSON.stringify(item, null, 2)
  formValues.value = valuesFromItem(item)
}

function startNewItem() {
  selected.value = null
  payload.value = '{}'
  formValues.value = valuesFromItem({})
}

function valuesFromItem(item: EntityRow) {
  const values: Record<string, string | boolean> = {}

  for (const field of resource.value?.writeFields ?? []) {
    const value = item[field]
    values[field] =
      typeof value === 'boolean'
        ? value
        : value === null || value === undefined
          ? ''
          : String(value)
  }

  return values
}

function payloadFromEditor() {
  if (!hasTypedForm.value) {
    return JSON.parse(payload.value) as EntityRow
  }

  const nextPayload: EntityRow = {}

  for (const [field, value] of Object.entries(formValues.value)) {
    if (typeof value === 'boolean' || value !== '') {
      nextPayload[field] = value
    }
  }

  return nextPayload
}

async function createItem() {
  if (!resource.value) {
    return
  }

  await saveItem(
    () => createResource(resource.value!.path, payloadFromEditor()),
    'Registro criado.'
  )
}

async function updateItem() {
  if (!resource.value || !selected.value?.id) {
    return
  }

  await saveItem(
    () => updateResource(resource.value!.path, String(selected.value!.id), payloadFromEditor()),
    'Registro atualizado.'
  )
}

async function saveItem(action: () => Promise<unknown>, successMessage: string) {
  errorMessage.value = null
  message.value = null

  try {
    await action()
    message.value = successMessage
    await loadItems()
  } catch (error) {
    errorMessage.value =
      error instanceof SyntaxError
        ? 'Payload JSON inválido.'
        : error instanceof Error
          ? error.message
          : 'Não foi possível salvar o registro.'
  }
}

function requestDelete(item: EntityRow) {
  pendingDelete.value = item
}

async function confirmDelete() {
  if (!resource.value || !pendingDelete.value?.id) {
    return
  }

  try {
    await deleteResource(resource.value.path, String(pendingDelete.value.id))
    message.value = 'Registro excluído.'
    pendingDelete.value = null
    await loadItems()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível excluir o registro.'
  }
}
</script>

<template>
  <main class="AdminResourceView">
    <h1>Administração: {{ resource?.label ?? 'Recurso' }}</h1>
    <p v-if="resource && !canAccessResource">
      Seu usuário não tem permissão para administrar este recurso.
    </p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <p v-if="message">{{ message }}</p>

    <section v-if="resource && canAccessResource" class="AdminResourceView-Layout">
      <div class="AdminResourceView-List">
        <div
          v-for="item in items"
          :key="String(item.id)"
          class="AdminResourceView-Row"
          data-cy="admin-row"
        >
          <EntityCard
            class="AdminResourceView-Item"
            :item="item"
            :title-fields="resource?.primaryFields"
            @click="selectItem(item)"
          />
          <button type="button" data-cy="admin-delete" @click="requestDelete(item)">Excluir</button>
        </div>
      </div>

      <section v-if="pendingDelete" class="AdminResourceView-Confirm">
        <p>Excluir o registro {{ pendingDelete.id }}?</p>
        <button type="button" data-cy="admin-confirm-delete" @click="confirmDelete">
          Confirmar exclusão
        </button>
        <button type="button" @click="pendingDelete = null">Cancelar</button>
      </section>

      <form
        class="AdminResourceView-Editor"
        data-cy="admin-editor"
        @submit.prevent="selected ? updateItem() : createItem()"
      >
        <template v-if="hasTypedForm">
          <label v-for="field in resource.writeFields" :key="field">
            {{ field }}
            <input
              v-if="field.startsWith('is_')"
              v-model="formValues[field]"
              type="checkbox"
              :true-value="true"
              :false-value="false"
            />
            <input v-else v-model="formValues[field]" />
          </label>
        </template>
        <label v-else>
          Payload JSON
          <textarea v-model="payload" rows="18" />
        </label>
        <button type="submit" data-cy="admin-submit">{{ selected ? 'Atualizar' : 'Criar' }}</button>
        <button type="button" data-cy="admin-new" @click="startNewItem">Novo</button>
      </form>
    </section>
  </main>
</template>

<style scoped lang="scss">
.AdminResourceView {
  padding: 24px;

  &-Layout {
    display: grid;
    gap: 24px;

    @media (min-width: $breakpoint-large) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &-List {
    display: grid;
    gap: 12px;
  }

  &-Row {
    display: grid;
    gap: 8px;
  }

  &-Item {
    cursor: pointer;
  }

  &-Editor {
    display: grid;
    gap: 12px;
  }

  &-Confirm {
    display: grid;
    gap: 8px;
  }

  textarea {
    width: 100%;
    font-family: monospace;
  }
}
</style>
