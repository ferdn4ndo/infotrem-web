<script setup lang="ts">
import { ref } from 'vue'

import EntityCard from '@/components/common/EntityCard.vue'
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
</script>

<template>
  <main class="OperationsView">
    <h1>Operações</h1>
    <p>
      Superfície administrativa para endpoints operacionais seguros expostos pelo backend. Rotinas
      internas como cronjobs ficam fora da UI.
    </p>

    <p v-if="errorMessage">{{ errorMessage }}</p>

    <section class="OperationsView-Section">
      <h2>Saúde da API</h2>
      <button type="button" :disabled="isLoading" @click="loadHealth">Consultar saúde</button>
      <EntityCard v-if="health" :item="health" :title-fields="['status', 'ok', 'message']" />
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
  gap: 20px;
  padding: 24px;

  &-Section {
    display: grid;
    gap: 12px;
  }
}
</style>
