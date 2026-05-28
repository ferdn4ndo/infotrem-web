<script setup lang="ts">
import { onMounted } from 'vue'

import EntityCard from '@/components/common/EntityCard.vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

onMounted(() => {
  auth.refreshMe()
})
</script>

<template>
  <main class="ProfileView">
    <h1>Meu Perfil</h1>
    <p v-if="auth.isLoading">Carregando...</p>
    <p v-else-if="auth.errorMessage">{{ auth.errorMessage }}</p>
    <EntityCard
      v-else-if="auth.user"
      :item="auth.user"
      :title-fields="['name', 'username', 'email']"
    />
  </main>
</template>

<style scoped lang="scss">
.ProfileView {
  padding: 24px;
}
</style>
