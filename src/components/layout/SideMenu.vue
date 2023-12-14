<script setup lang="ts">
import { type Ref, ref } from 'vue'
import { getAll } from '@/services/menu.service'
import type { MenuItem } from '~/types/menu-item.type'
import type { MenuList } from '~/types/meny-list.type'
import TextInput from '../input/TextInput.vue'

const searchMenuText = ref('')

function handleSearchMenuInputChanged() {
  console.log('search menu text: ' + searchMenuText.value)
}

function handleMenuItemClicked(item: MenuItem) {
  console.log('menu item clicked: ' + item)
}

const menuList: Ref<MenuList> = ref([])
getAll().then((responseItems) => (menuList.value = responseItems))
</script>

<template>
  <div class="SideMenu">
    <div class="SideMenu-SearchContainer">
      <TextInput
        v-model="searchMenuText"
        id="inputSearchMenu"
        name="inputSearchMenu"
        placeholder="Procurar no menu..."
        class="SideMenu-SearchInput"
        @input.stop="handleSearchMenuInputChanged"
      />
    </div>

    <hr class="SideMenu-Divider" />

    <nav class="SideMenu-LinksContainer">
      <div
        class="SideMenu-ParentWrapper"
        v-for="(parentItem, parentKey) in menuList"
        :key="parentKey"
      >
        <a
          class="SideMenu-ParentLink SideMenu-Link"
          @click.stop="handleMenuItemClicked(parentItem)"
          :title="parentItem.title"
        >
          <font-awesome-icon :icon="parentItem.icon" />
          {{ parentItem.title }}
        </a>

        <div class="SideMenu-ChildrenWrapper" v-if="parentItem.children !== null">
          <div
            class="SideMenu-ChildWrapper"
            v-for="(childItem, childKey) in parentItem.children"
            :key="childKey"
          >
            <a
              class="SideMenu-ChildLink SideMenu-Link"
              @click.stop="handleMenuItemClicked(childItem)"
              :title="childItem.title"
            >
              <font-awesome-icon :icon="childItem.icon" />
              {{ childItem.title }}
            </a>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.SideMenu {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 60px);

  @media (min-width: $breakpoint-medium) {
    width: 300px;
  }

  color: var(--color-heading);

  background-color: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);

  z-index: 99;

  &-SearchContainer {
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
  }

  &-SearchInput {
    width: 100%;
    box-sizing: border-box;
  }

  &-Divider {
    border-bottom: 1px solid var(--color-border);
    margin: 20px 10px;
  }

  &-LinksContainer {
    padding: 10px 20px;
  }

  &-ParentWrapper {
    padding: 5px 5px;
  }

  &-ParentLink {
    font-size: 20px;
  }

  &-ChildrenWrapper {
    padding: 5px 5px;
  }

  &-ChildWrapper {
    padding: 5px 5px;
  }

  &-ChildLink {
    font-size: 18px;
  }

  &-Link {
    cursor: pointer;
  }
}
</style>
