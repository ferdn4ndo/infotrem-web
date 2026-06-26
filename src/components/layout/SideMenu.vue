<script setup lang="ts">
import { computed } from 'vue'
import { getAll } from '@/services/menu.service'
import { useAuthStore } from '@/stores/auth.store'
import type { MenuItem } from '~/types/menu-item.type'
import { RouterLink } from 'vue-router'

const auth = useAuthStore()

const menuList = computed(() => getAll(auth.isLoggedIn, auth.isStaff, auth.isAdmin))

const emit = defineEmits<{
  (e: 'navigate'): void
}>()

function handleMenuItemClicked(item: MenuItem) {
  if (item.path) {
    emit('navigate')
  }
}
</script>

<template>
  <aside class="SideMenu" aria-label="Menu principal">
    <nav class="SideMenu-LinksContainer">
      <div class="SideMenu-ParentWrapper" v-for="parentItem in menuList" :key="parentItem.id">
        <RouterLink
          v-if="parentItem.path"
          class="SideMenu-ParentLink SideMenu-Link"
          :to="parentItem.path"
          :title="parentItem.title"
          @click="handleMenuItemClicked(parentItem)"
        >
          <font-awesome-icon :icon="parentItem.icon" />
          {{ parentItem.title }}
        </RouterLink>
        <span v-else class="SideMenu-ParentGroup SideMenu-Link" :title="parentItem.title">
          <font-awesome-icon :icon="parentItem.icon" />
          {{ parentItem.title }}
        </span>

        <div class="SideMenu-ChildrenWrapper" v-if="parentItem.children !== null">
          <div
            class="SideMenu-ChildWrapper"
            v-for="childItem in parentItem.children"
            :key="childItem.id"
          >
            <RouterLink
              v-if="childItem.path"
              class="SideMenu-ChildLink SideMenu-Link"
              :to="childItem.path"
              :title="childItem.title"
              @click="handleMenuItemClicked(childItem)"
            >
              <font-awesome-icon :icon="childItem.icon" />
              {{ childItem.title }}
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style lang="scss" scoped>
.SideMenu {
  position: fixed;
  top: var(--header-height);
  left: 0;
  width: min(85vw, 320px);
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
  color: var(--color-heading);
  background-color: var(--color-background-soft);
  border-right: 1px solid var(--color-border);
  box-shadow: 0 0 var(--space-4) var(--color-shadow);
  z-index: $z-index-d;

  &-LinksContainer {
    padding: var(--space-4);
  }

  &-ParentWrapper {
    padding: var(--space-1) 0;
  }

  &-ParentLink {
    font-size: var(--font-size-lg);
    font-weight: $font-weight-bold;
  }

  &-ParentGroup {
    font-size: var(--font-size-lg);
    font-weight: $font-weight-bold;
    opacity: 0.9;
  }

  &-ChildrenWrapper {
    padding: var(--space-2) var(--space-4);
  }

  &-ChildWrapper {
    padding: var(--space-1) 0;
  }

  &-ChildLink {
    font-size: var(--font-size-md);
  }

  &-Link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text);
    text-decoration: none;
    border-radius: $radius-md;
    padding: var(--space-1) var(--space-2);

    &:focus-visible {
      outline: 2px solid var(--color-primary-border);
      outline-offset: 2px;
    }
  }
}
</style>
