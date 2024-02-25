<script setup lang="ts">
import { ref } from 'vue'

const profileName = ref('Fernando')
const profileFullName = ref('Fernando Constantino')
const profileEmail = ref('test@test.com')
const profileAvatarUrl = ref('https://i.imgur.com/W5aQffS.jpg')
const showCollapse = ref(false);

function handleLogoutClick() {
  console.log('logout option clicked')
}

function handleProfileClick() {
  console.log('profile option clicked')
}

function handleCollapseClick() {
  showCollapse.value = !showCollapse.value;
}

function getIcon() {
  return showCollapse.value ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"
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
          <a
            @click.stop="handleLogoutClick"
            class="ProfileCollapseCard-Link"
            title="Clique aqui para encerrar sua sessão atual."
          >
            Sair
          </a>
        </li>
        <li>
          <a
            @click.stop="handleProfileClick"
            class="ProfileCollapseCard-Link"
            title="Clique aqui para ver o seu perfil."
          >
            Meu Perfil
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ProfileCollapseCard {
  background-color: var(--color-secondary-normal);
  border-color: var(--color-secondary-border);
  border-width: 1px;
  border-style: solid;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;

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
    margin: 0 10px;
  }

  &-Name {
    font-size: 16px;
    text-wrap: nowrap;
  }

  &-Email {
    font-size: 12px;
    color: var(--color-text-secondary);
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

  &-Top {
    display: flex;
    flex-wrap: nowrap;
  }

  &-Bottom {
    padding-left: 10px;
  }
}

</style>
