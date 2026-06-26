<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import AppCard from '@/components/common/AppCard.vue'
import StatusMessage from '@/components/common/StatusMessage.vue'
import * as AuthApi from '@/services/api/auth.api'

const route = useRoute()
const message = ref('Validando e-mail...')
const hasError = ref(false)

onMounted(async () => {
  try {
    const response = await AuthApi.checkEmailValidation(
      String(route.params.userId),
      String(route.params.validationHash)
    )
    message.value = String(response.message ?? 'E-mail validado.')
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Não foi possível validar o e-mail.'
    hasError.value = true
  }
})
</script>

<template>
  <section class="EmailValidationView">
    <h1>Validação de e-mail</h1>
    <AppCard>
      <StatusMessage :state="hasError ? 'error' : 'empty'" :message="message" />
    </AppCard>
  </section>
</template>

<style scoped lang="scss">
.EmailValidationView {
  width: 100%;
  max-width: $breakpoint-medium;
  margin: 0 auto;
  padding: var(--space-4);

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
