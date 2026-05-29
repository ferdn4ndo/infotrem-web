<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import EntityCard from '@/components/common/EntityCard.vue'
import { findResource, type ResourceConfig } from '@/services/api/resources'
import { listResource } from '@/services/api/resources.api'
import type { EntityRow } from '@/types/domain/common.type'

const route = useRoute()
const items = ref<EntityRow[]>([])
const count = ref(0)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const resource = computed<ResourceConfig | undefined>(() =>
  findResource(String(route.params.resource))
)

watchEffect(async () => {
  if (!resource.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await listResource(resource.value.path, { limit: 50 })
    items.value = response.items
    count.value = response.count
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível carregar os dados.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main class="ResourceListView">
    <h1>{{ resource?.label ?? 'Recurso não encontrado' }}</h1>

    <p v-if="isLoading">Carregando...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="!resource">Este recurso ainda não está configurado no frontend.</p>
    <p v-else-if="items.length === 0">Nenhum registro encontrado.</p>

    <p v-if="resource && !isLoading && !errorMessage">{{ count }} registro(s)</p>

    <section class="ResourceListView-Grid">
      <RouterLink
        v-for="item in items"
        :key="String(item.id)"
        class="ResourceListView-Link"
        :to="{ name: 'resource-detail', params: { resource: resource?.key, id: String(item.id) } }"
      >
        <EntityCard :item="item" :title-fields="resource?.primaryFields" />
      </RouterLink>
    </section>
  </main>
</template>

<style scoped lang="scss">
.ResourceListView {
  padding: 24px;

  &-Grid {
    display: grid;
    gap: 16px;
  }

  &-Link {
    color: inherit;
    text-decoration: none;
  }
}
</style>
