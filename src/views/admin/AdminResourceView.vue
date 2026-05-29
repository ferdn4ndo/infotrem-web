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
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()
const items = ref<EntityRow[]>([])
const selected = ref<EntityRow | null>(null)
const payload = ref('{}')
const errorMessage = ref<string | null>(null)
const message = ref<string | null>(null)

const resource = computed(() => findResource(String(route.params.resource)))

async function loadItems() {
  if (!resource.value) {
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
}

function startNewItem() {
  selected.value = null
  payload.value = '{}'
}

async function createItem() {
  if (!resource.value) {
    return
  }

  await createResource(resource.value.path, JSON.parse(payload.value))
  message.value = 'Registro criado.'
  await loadItems()
}

async function updateItem() {
  if (!resource.value || !selected.value?.id) {
    return
  }

  await updateResource(resource.value.path, String(selected.value.id), JSON.parse(payload.value))
  message.value = 'Registro atualizado.'
  await loadItems()
}

async function removeItem(item: EntityRow) {
  if (!resource.value || !item.id || !window.confirm('Excluir este registro?')) {
    return
  }

  await deleteResource(resource.value.path, String(item.id))
  message.value = 'Registro excluído.'
  await loadItems()
}
</script>

<template>
  <main class="AdminResourceView">
    <h1>Administração: {{ resource?.label ?? 'Recurso' }}</h1>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <p v-if="message">{{ message }}</p>

    <section class="AdminResourceView-Layout">
      <div class="AdminResourceView-List">
        <EntityCard
          v-for="item in items"
          :key="String(item.id)"
          class="AdminResourceView-Item"
          :item="item"
          :title-fields="resource?.primaryFields"
          @click="selectItem(item)"
        />
        <button
          v-for="item in items"
          :key="`delete-${item.id}`"
          type="button"
          @click="removeItem(item)"
        >
          Excluir {{ item.id }}
        </button>
      </div>

      <form
        class="AdminResourceView-Editor"
        @submit.prevent="selected ? updateItem() : createItem()"
      >
        <label>
          Payload JSON
          <textarea v-model="payload" rows="18" />
        </label>
        <button type="submit">{{ selected ? 'Atualizar' : 'Criar' }}</button>
        <button type="button" @click="startNewItem">Novo</button>
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

  &-Item {
    cursor: pointer;
  }

  &-Editor {
    display: grid;
    gap: 12px;
  }

  textarea {
    width: 100%;
    font-family: monospace;
  }
}
</style>
