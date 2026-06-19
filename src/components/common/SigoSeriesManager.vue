<script setup lang="ts">
import { computed } from 'vue'

import RelationManager from '@/components/common/RelationManager.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import { findResource } from '@/services/api/resources'

const props = defineProps<{
  informationId: string
}>()

const informationResource = computed(() => findResource('information'))
const sigoSeriesRelation = computed(() =>
  informationResource.value?.relations?.find((relation) => relation.pathSuffix === 'sigo-series')
)
</script>

<template>
  <section class="SigoSeriesManager">
    <header class="SigoSeriesManager-Header">
      <h2>Séries SIGO</h2>
      <p>Gestão de séries associadas a esta informação.</p>
    </header>

    <StatusMessage
      v-if="!informationResource || !sigoSeriesRelation"
      state="error"
      message="Configuração de séries SIGO indisponível no frontend."
    />

    <RelationManager
      v-else
      :relation="sigoSeriesRelation"
      :parent-resource="informationResource"
      :parent-id="props.informationId"
    />
  </section>
</template>

<style scoped lang="scss">
.SigoSeriesManager {
  display: grid;
  gap: var(--space-3);

  &-Header {
    display: grid;
    gap: var(--space-1);

    h2,
    p {
      margin: 0;
    }
  }
}
</style>
