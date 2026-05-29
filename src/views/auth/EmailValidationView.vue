<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import * as AuthApi from '@/services/api/auth.api'

const route = useRoute()
const message = ref('Validando e-mail...')

onMounted(async () => {
  try {
    const response = await AuthApi.checkEmailValidation(
      String(route.params.userId),
      String(route.params.validationHash)
    )
    message.value = String(response.message ?? 'E-mail validado.')
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Não foi possível validar o e-mail.'
  }
})
</script>

<template>
  <main class="EmailValidationView">
    <h1>Validação de e-mail</h1>
    <p>{{ message }}</p>
  </main>
</template>

<style scoped lang="scss">
.EmailValidationView {
  padding: 24px;
}
</style>
