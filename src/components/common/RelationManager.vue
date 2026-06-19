<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import AppButton from '@/components/common/AppButton.vue'
import AppCard from '@/components/common/AppCard.vue'
import AppPagination from '@/components/common/AppPagination.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import ResourceForm from '@/components/common/ResourceForm.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { canCreate, canDelete, canEdit } from '@/services/api/permissions'
import type { RelationConfig, ResourceConfig } from '@/services/api/resources'
import { createNested, deleteNested, listNested } from '@/services/api/social.api'
import { useAuthStore } from '@/stores/auth.store'
import type { EntityRow } from '@/types/domain/common.type'

type RelationManagerProps = {
  relation: RelationConfig
  parentResource: ResourceConfig
  parentId: string
  parentPathOverride?: string
}

const props = defineProps<RelationManagerProps>()
const auth = useAuthStore()
const route = useRoute()

const pageLimit = 12
const offset = ref(0)
const rows = ref<EntityRow[]>([])
const totalCount = ref(0)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const actionErrorMessage = ref<string | null>(null)
const createOpen = ref(false)
const editingRow = ref<EntityRow | null>(null)
const deletingRow = ref<EntityRow | null>(null)
let activeRequestId = 0
let activeLoadController: AbortController | null = null

const relationAsResource = computed<ResourceConfig>(() => ({
  key: props.relation.key,
  label: props.relation.label,
  path: relationPath.value,
  access: props.relation.access,
  primaryFields: props.relation.primaryFields,
  writeFields: props.relation.writeFields
}))

const parentPath = computed(
  () => props.parentPathOverride ?? `${props.parentResource.path}/${props.parentId}`
)
const relationPath = computed(() => `${parentPath.value}/${props.relation.pathSuffix}`)
const writable = computed(
  () =>
    props.relation.kind !== 'readonly' &&
    (props.relation.kind === 'owned-toggle' || Boolean(props.relation.writeFields))
)
const canAdd = computed(() => writable.value && canCreate(relationAsResource.value, auth))
const canModify = computed(() => writable.value && canEdit(relationAsResource.value, auth))
const canRemove = computed(() => writable.value && canDelete(relationAsResource.value, auth))
const isOwnedToggle = computed(() => props.relation.kind === 'owned-toggle')

const currentUserRow = computed(() => {
  const currentUserId = String(auth.user?.id ?? '')
  if (!currentUserId) {
    return null
  }

  return (
    rows.value.find((row) =>
      ['user_id', 'liked_by_id', 'favorited_by_id', 'created_by_id', 'owner_id'].some(
        (field) => String(row[field] ?? '') === currentUserId
      )
    ) ?? null
  )
})

const ownsRelation = computed(() => Boolean(currentUserRow.value?.id))
const toggleLabel = computed(() =>
  ownsRelation.value ? `Remover ${props.relation.label.toLowerCase()}` : props.relation.label
)
const deleteDialogOpen = computed({
  get: () => Boolean(deletingRow.value),
  set: (nextValue: boolean) => {
    if (!nextValue) {
      deletingRow.value = null
    }
  }
})

async function loadRows() {
  const requestId = ++activeRequestId
  activeLoadController?.abort()
  activeLoadController = new AbortController()
  const controller = activeLoadController
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await listNested(
      parentPath.value,
      props.relation.pathSuffix,
      {
        limit: pageLimit,
        offset: offset.value
      },
      { signal: controller.signal }
    )
    if (controller.signal.aborted || requestId !== activeRequestId) {
      return
    }
    rows.value = response.items
    totalCount.value = response.count
  } catch (error) {
    if (controller.signal.aborted || requestId !== activeRequestId) {
      return
    }
    errorMessage.value =
      error instanceof Error ? error.message : `Não foi possível carregar ${props.relation.label}.`
  } finally {
    if (!controller.signal.aborted && requestId === activeRequestId) {
      isLoading.value = false
    }
  }
}

async function handleDelete() {
  if (!deletingRow.value?.id) {
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    await deleteNested(parentPath.value, props.relation.pathSuffix, String(deletingRow.value.id))
    actionMessage.value = 'Registro removido com sucesso.'
    deletingRow.value = null
    await loadRows()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível remover o registro.'
  }
}

async function toggleOwnedRelation() {
  if (!auth.isLoggedIn) {
    actionErrorMessage.value = 'Entre com sua conta para realizar esta ação.'
    return
  }

  actionErrorMessage.value = null
  actionMessage.value = null

  try {
    if (currentUserRow.value?.id) {
      await deleteNested(
        parentPath.value,
        props.relation.pathSuffix,
        String(currentUserRow.value.id)
      )
      actionMessage.value = `${props.relation.label} removido.`
    } else {
      await createNested(parentPath.value, props.relation.pathSuffix)
      actionMessage.value = `${props.relation.label} registrado.`
    }
    await loadRows()
  } catch (error) {
    actionErrorMessage.value =
      error instanceof Error ? error.message : `Não foi possível atualizar ${props.relation.label}.`
  }
}

function handleOffsetChange(nextOffset: number) {
  offset.value = nextOffset
}

function routeToSection(row: EntityRow) {
  const routeId = String(route.params.id ?? '')
  const sectionId = String(row.id ?? '')
  return { name: 'route-section-detail', params: { routeId, sectionId } }
}

watchEffect((onCleanup) => {
  void loadRows()
  onCleanup(() => {
    activeLoadController?.abort()
  })
})
</script>

<template>
  <section class="RelationManager">
    <header class="RelationManager-Header">
      <h2>{{ relation.label }}</h2>
      <AppButton
        v-if="isOwnedToggle && canAdd"
        type="button"
        data-cy="relation-toggle"
        @click="toggleOwnedRelation"
      >
        {{ toggleLabel }}
      </AppButton>
      <AppButton v-else-if="canAdd" type="button" data-cy="relation-add" @click="createOpen = true">
        Adicionar
      </AppButton>
    </header>

    <StatusMessage v-if="actionMessage" state="empty" :message="actionMessage" />
    <StatusMessage v-if="actionErrorMessage" state="error" :message="actionErrorMessage" />
    <StatusMessage v-if="isLoading" state="loading" message="Carregando registros..." />
    <StatusMessage v-else-if="errorMessage" state="error" :message="errorMessage" />

    <EmptyState
      v-else-if="rows.length === 0"
      title="Nenhum registro encontrado"
      description="Não há itens relacionados nesta seção."
    />

    <section v-else class="RelationManager-List">
      <article
        v-for="row in rows"
        :key="String(row.id)"
        class="RelationManager-ListItem"
        data-cy="relation-row"
      >
        <RouterLink
          v-if="parentResource.key === 'routes' && relation.key === 'sections'"
          class="RelationManager-Link"
          :to="routeToSection(row)"
        >
          <AppCard>
            <EntityCard :item="row" :title-fields="relation.primaryFields" />
          </AppCard>
        </RouterLink>
        <AppCard v-else>
          <EntityCard :item="row" :title-fields="relation.primaryFields" />
        </AppCard>

        <div v-if="canModify || canRemove" class="RelationManager-Actions">
          <AppButton
            v-if="canModify && relation.writeFields"
            type="button"
            variant="ghost"
            data-cy="relation-edit"
            @click="editingRow = row"
          >
            Editar
          </AppButton>
          <AppButton
            v-if="canRemove"
            type="button"
            variant="danger"
            data-cy="relation-delete"
            @click="deletingRow = row"
          >
            Excluir
          </AppButton>
        </div>
      </article>
    </section>

    <AppPagination
      v-if="totalCount > pageLimit"
      :count="totalCount"
      :limit="pageLimit"
      :offset="offset"
      @update:offset="handleOffsetChange"
    />

    <AppCard
      v-if="createOpen && relation.writeFields"
      class="RelationManager-FormCard"
      data-cy="relation-create-form"
    >
      <h3>Novo registro</h3>
      <ResourceForm
        :resource="relationAsResource"
        :path-override="relationPath"
        submit-label="Criar"
        @saved="
          async () => {
            createOpen = false
            await loadRows()
          }
        "
        @cancel="createOpen = false"
      />
    </AppCard>

    <AppCard
      v-if="editingRow && relation.writeFields"
      class="RelationManager-FormCard"
      data-cy="relation-edit-form"
    >
      <h3>Editar registro</h3>
      <ResourceForm
        :resource="relationAsResource"
        :path-override="relationPath"
        :record="editingRow"
        submit-label="Salvar"
        @saved="
          async () => {
            editingRow = null
            await loadRows()
          }
        "
        @cancel="editingRow = null"
      />
    </AppCard>

    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Confirmar exclusão"
      message="Deseja realmente excluir este registro relacionado?"
      confirm-label="Excluir"
      @confirm="handleDelete"
      @cancel="deletingRow = null"
    />
  </section>
</template>

<style scoped lang="scss">
.RelationManager {
  display: grid;
  gap: var(--space-3);

  &-Header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  &-List {
    display: grid;
    gap: var(--space-3);
  }

  &-ListItem {
    display: grid;
    gap: var(--space-2);
  }

  &-Link {
    color: inherit;
    text-decoration: none;
  }

  &-Actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  &-FormCard {
    display: grid;
    gap: var(--space-2);

    h3 {
      margin: 0;
      font-size: var(--font-size-lg);
    }
  }
}
</style>
