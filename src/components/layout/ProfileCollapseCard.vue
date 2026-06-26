<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const profileName = computed(() => auth.displayName)
const profileFullName = computed(() => auth.displayName)
const profileEmail = computed(() =>
  String(auth.user?.email ?? 'Faça login para acessar seu perfil')
)
const profileAvatarUrl = computed(() => String(auth.user?.avatar_url ?? '/logo-light-bg.svg'))

function handleLogoutClick() {
  auth.logout()
  router.push({ name: 'home' })
}

function handleProfileClick() {
  router.push({ name: auth.isLoggedIn ? 'me' : 'login' })
}
</script>

<template>
  <div class="ProfileCollapseCard">
    <div class="ProfileCollapseCard-Top">
      <div class="ProfileCollapseCard-AvatarWrapper">
        <img
          class="ProfileCollapseCard-AvatarImage"
          :src="profileAvatarUrl"
          :alt="`Foto do perfil de ${profileName}`"
        />
      </div>

      <div class="ProfileCollapseCard-DataWrapper">
        <div class="ProfileCollapseCard-Name">
          {{ profileFullName }}
        </div>

        <div class="ProfileCollapseCard-Email">
          {{ profileEmail }}
        </div>
      </div>
    </div>
    <div class="ProfileCollapseCard-Bottom">
      <ul class="ProfileCollapseCard-Links">
        <li>
          <button
            type="button"
            @click.stop="handleLogoutClick"
            class="ProfileCollapseCard-Link"
            title="Clique aqui para encerrar sua sessão atual."
          >
            Sair
          </button>
        </li>
        <li>
          <button
            type="button"
            @click.stop="handleProfileClick"
            class="ProfileCollapseCard-Link"
            title="Clique aqui para ver o seu perfil."
          >
            Meu Perfil
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ProfileCollapseCard {
  background-color: var(--color-secondary-normal);
  border-color: var(--color-secondary-border);
  border-width: 1px;
  border-style: solid;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: var(--space-2);

  &-AvatarWrapper {
    flex: 0 0 50px;
  }

  &-AvatarImage {
    width: 50px;
  }

  &-ButtonWrapper {
    display: flex;
    align-items: center;
    padding-right: 10px;
  }

  &-DataWrapper {
    flex: 1 1 auto;
    margin: 0 var(--space-2);
  }

  &-Name {
    font-size: var(--font-size-md);
    text-wrap: nowrap;
  }

  &-Email {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    text-wrap: nowrap;
  }

  &-Links {
    display: grid;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
    text-wrap: nowrap;
    text-align: left;
  }

  &-Link {
    width: 100%;
    text-align: left;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-background-soft);
    font-size: var(--font-size-sm);
    padding: var(--space-2);
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--color-primary-border);
      outline-offset: 2px;
    }
  }

  &-Top {
    display: flex;
    flex-wrap: nowrap;
  }

  &-Bottom {
    padding-top: var(--space-2);
  }
}
</style>
