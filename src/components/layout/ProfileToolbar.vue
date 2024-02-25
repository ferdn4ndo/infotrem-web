<script setup lang="ts">
import { ref } from 'vue'

export interface ProfileToolbarProps {
  isCollapseOpened: boolean
}

const props = withDefaults(defineProps<ProfileToolbarProps>(), {
  isCollapseOpened: false,
})

const emit = defineEmits<{
  (e: 'chevron-click'): void
}>()

const profileName = ref('Fernando')
const profileFullName = ref('Fernando Constantino')
const profileEmail = ref('test@test.com')
const profileAvatarUrl = ref('https://i.imgur.com/W5aQffS.jpg')

function handleLogoutClick() {
  console.log('logout option clicked')
}

function handleProfileClick() {
  console.log('profile option clicked')
}

function handleCollapseClick() {
  emit('chevron-click');
}

function getIcon() {
  return props.isCollapseOpened ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"
}
</script>

<template>
  <div class="ProfileToolbar" @click="handleCollapseClick">
    <div class="ProfileToolbar-VisibleWrapper">
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
      </div>

      <div class="ProfileToolbar-ButtonWrapper">
        <Transition name="fade" mode="out-in">
          <font-awesome-icon :key="new Date().getTime()" :icon="getIcon()" />
        </Transition>
      </div>
    </div>

  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.ProfileToolbar {
  height: 40px;
  margin: 5px 10px;
  position: relative;
  cursor: pointer;

  background-color: var(--color-secondary-normal);
  border-color: var(--color-secondary-border);
  border-width: 1px;
  border-style: solid;
  border-radius: 10px;

  &:hover {
    background-color: var(--color-secondary-hover);
  }

  &:active {
    background-color: var(--color-secondary-active);
  }

  &-VisibleWrapper {
    z-index: $z-index-c;
    position: relative;

    display: flex;
    flex-wrap: nowrap;

    width: auto;
    height: 100%
  }

  &-AvatarWrapper {
    flex: 0 0 40px;
  }

  &-AvatarImage {
    width: 40px;
    border-radius: 10px;
  }

  &-ButtonWrapper {
    display: flex;
    align-items: center;
    padding-right: 10px;
    margin-left: 10px;
  }

  &-DataWrapper {
    flex: 1 1 auto;
    margin-left: 10px;

    display: none;
    align-items: center;

    @media (min-width: $breakpoint-large) {
      display: flex;
    }
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
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
