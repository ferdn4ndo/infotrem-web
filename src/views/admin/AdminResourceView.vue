<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import ResourceForm from '@/components/common/ResourceForm.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
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
const errorMessage = ref<string | null>(null)
const message = ref<string | null>(null)
const isLoading = ref(false)
const count = ref(0)
const pageLimit = 24
const offset = ref(0)
let activeRequestId = 0

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
const deleteDialogOpen = computed({
  get: () => Boolean(pendingDelete.value),
  set: (nextValue: boolean) => {
    if (!nextValue) {
      pendingDelete.value = null
    }
  }
})

async function loadItems() {
  if (!resource.value || !canAccessResource.value) {
    items.value = []
    count.value = 0
    return
  }

  const response = await listResource(resource.value.path, {
    limit: pageLimit,
    offset: offset.value
  })
  items.value = response.items
  count.value = response.count
}

watchEffect((onCleanup) => {
  const requestId = ++activeRequestId
  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  errorMessage.value = null
  message.value = null
  isLoading.value = true

  void loadItems()
    .catch((error) => {
      if (cancelled || requestId !== activeRequestId) {
        return
      }
      errorMessage.value =
        error instanceof Error ? error.message : 'Não foi possível carregar o recurso.'
    })
    .finally(() => {
      if (!cancelled && requestId === activeRequestId) {
        isLoading.value = false
      }
    })
})

function selectItem(item: EntityRow) {
  selected.value = item
  payload.value = JSON.stringify(item, null, 2)
}

function startNewItem() {
  selected.value = null
  payload.value = '{}'
}

async function createItem() {
  if (!resource.value) {
    return
  }

  await saveItem(
    () => createResource(resource.value!.path, JSON.parse(payload.value) as EntityRow),
    'Registro criado.'
  )
}

async function updateItem() {
  if (!resource.value || !selected.value?.id) {
    return
  }

  await saveItem(
    () =>
      updateResource(
        resource.value!.path,
        String(selected.value!.id),
        JSON.parse(payload.value) as EntityRow
      ),
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

async function handleTypedSaved() {
  message.value = selected.value ? 'Registro atualizado.' : 'Registro criado.'
  errorMessage.value = null
  selected.value = null
  await loadItems()
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

function handleOffsetChange(nextOffset: number) {
  offset.value = nextOffset
}
</script>

<template>
  <section class="AdminResourceView">
    <h1>Administração: {{ resource?.label ?? 'Recurso' }}</h1>
    <EmptyState
      v-if="resource && !canAccessResource"
      title="Acesso negado"
      description="Seu usuário não tem permissão para administrar este recurso."
    />
    <StatusMessage v-if="isLoading" state="loading" message="Carregando registros..." />
    <StatusMessage v-if="errorMessage" state="error" :message="errorMessage" />
    <StatusMessage v-if="message" state="empty" :message="message" />
    <EmptyState
      v-if="resource && canAccessResource && !isLoading && !errorMessage && items.length === 0"
      title="Nenhum registro encontrado"
      description="Ainda não existem registros para este recurso."
    />

    <section
      v-if="resource && canAccessResource && items.length > 0"
      class="AdminResourceView-Layout"
    >
      <div class="AdminResourceView-List">
        <div
          v-for="item in items"
          :key="String(item.id)"
          class="AdminResourceView-Row"
          data-cy="admin-row"
        >
          <AppCard>
            <EntityCard
              class="AdminResourceView-Item"
              :item="item"
              :title-fields="resource?.primaryFields"
              @click="selectItem(item)"
            />
          </AppCard>
          <AppButton
            type="button"
            variant="danger"
            data-cy="admin-delete"
            @click="requestDelete(item)"
          >
            Excluir
          </AppButton>
        </div>
      </div>

      <section class="AdminResourceView-Editor" data-cy="admin-editor">
        <template v-if="hasTypedForm">
          <ResourceForm
            :resource="resource"
            :record="selected"
            :submit-label="selected ? 'Atualizar' : 'Criar'"
            @saved="handleTypedSaved"
            @cancel="startNewItem"
          />
          <AppButton type="button" variant="ghost" data-cy="admin-new" @click="startNewItem">
            Novo
          </AppButton>
        </template>
        <form v-else @submit.prevent="selected ? updateItem() : createItem()">
          <label>
            Payload JSON
            <textarea v-model="payload" rows="18" />
          </label>
          <AppButton type="submit" data-cy="admin-submit">
            {{ selected ? 'Atualizar' : 'Criar' }}
          </AppButton>
          <AppButton type="button" variant="ghost" data-cy="admin-new" @click="startNewItem">
            Novo
          </AppButton>
        </form>
      </section>
    </section>

    <AppPagination
      v-if="count > pageLimit && resource && canAccessResource"
      :limit="pageLimit"
      :offset="offset"
      :count="count"
      @update:offset="handleOffsetChange"
    />
    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Confirmar exclusão"
      :message="`Excluir o registro ${pendingDelete?.id}?`"
      confirm-label="Excluir"
      cancel-label="Cancelar"
      @confirm="confirmDelete"
    />
  </section>
</template>

<style scoped lang="scss">
.AdminResourceView {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Layout {
    display: grid;
    gap: var(--space-5);

    @media (min-width: $breakpoint-large) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &-List {
    display: grid;
    gap: var(--space-3);
  }

  &-Row {
    display: grid;
    gap: var(--space-2);
  }

  &-Item {
    cursor: pointer;
  }

  &-Editor {
    display: grid;
    gap: var(--space-3);
    max-width: 560px;
  }

  textarea {
    width: 100%;
    font-family: monospace;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
