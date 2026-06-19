<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AppCard from '@/components/common/AppCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import EntityCard from '@/components/common/EntityCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import * as OperationsApi from '@/services/api/operations.api'
import type { EntityRow } from '@/types/domain/common.type'

const health = ref<EntityRow | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function loadHealth() {
  isLoading.value = true
  errorMessage.value = null

  try {
    health.value = await OperationsApi.getHealth()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Não foi possível consultar a saúde da API.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadHealth)
</script>

<template>
  <main class="OperationsView">
    <h1>Operações</h1>
    <p>
      Superfície administrativa para endpoints operacionais seguros expostos pelo backend. Rotinas
      internas como cronjobs ficam fora da UI.
    </p>

    <StatusMessage v-if="errorMessage" state="error" :message="errorMessage" />

    <section class="OperationsView-Section">
      <h2>Saúde da API</h2>
      <button type="button" :disabled="isLoading" @click="loadHealth">Consultar saúde</button>
      <StatusMessage v-if="isLoading" state="loading" message="Consultando saúde da API..." />
      <EmptyState
        v-else-if="!health"
        title="Sem dados de saúde"
        description="Use o botão para atualizar o status da API."
      />
      <AppCard v-else>
        <EntityCard :item="health" :title-fields="['status', 'ok', 'message']" />
      </AppCard>
    </section>

    <section class="OperationsView-Section">
      <h2>Documentação da API</h2>
      <a
        v-for="link in OperationsApi.docsLinks"
        :key="link.href"
        :href="link.href"
        target="_blank"
        rel="noreferrer"
      >
        {{ link.label }}
      </a>
    </section>
  </main>
</template>

<style scoped lang="scss">
.OperationsView {
  display: grid;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: var(--space-5);
  padding: var(--space-4);

  &-Section {
    display: grid;
    gap: var(--space-3);
    max-width: 720px;
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
