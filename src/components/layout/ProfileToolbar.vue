<script setup lang="ts">
import { ref } from 'vue'

const profileName = ref('Fernando Constantino')
const profileAvatarUrl = ref('https://i.imgur.com/W5aQffS.jpg')

function handleLogoutClick() {
  console.log('logout option clicked')
}

function handleProfileClick() {
  console.log('profile option clicked')
}
</script>

<template>
  <div class="ProfileToolbar">
    <div class="ProfileToolbar-AvatarWrapper">
      <img
        class="ProfileToolbar-AvatarImage"
        :src="profileAvatarUrl"
        :alt="`Foto do perfil de ${profileName}`"
      />
    </div>
    <div class="ProfileToolbar-DataWrapper">
      <div class="ProfileToolbar-Name">
        {{ profileName }}
      </div>

      <div class="ProfileToolbar-Links">
        <a
          @click.stop="handleLogoutClick"
          class="ProfileToolbar-Link"
          title="Clique aqui para encerrar sua sessão atual."
        >
          Sair
        </a>
        <a
          @click.stop="handleProfileClick"
          class="ProfileToolbar-Link"
          title="Clique aqui para ver o seu perfil."
        >
          Meu Perfil
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ProfileToolbar {
  height: 50px;
  margin: 5px 10px;

  background-color: var(--color-secondary-normal);
  border-color: var(--color-secondary-border);
  border-width: 1px;
  border-style: solid;

  display: flex;
  flex-wrap: nowrap;

  &-AvatarWrapper {
    flex: 0 0 50px;
  }

  &-AvatarImage {
    width: 50px;
  }

  &-DataWrapper {
    flex: 1 1 auto;
    margin: 0 10px;
  }

  &-Name {
    font-size: 16px;
    text-wrap: nowrap;
  }

  &-Links {
    margin: 2px;
    text-wrap: nowrap;
    text-align: right;
  }

  &-Link {
    font-size: 14px;
    padding: 0 5px;
    cursor: pointer;
  }
}
</style>
