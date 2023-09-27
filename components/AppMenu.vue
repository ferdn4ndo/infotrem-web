<template>
  <v-navigation-drawer
    v-model="showMenu"
    :rail="rail"
    :clipped="true"
    fixed
    app
    @click="rail = false"
  >
    <v-list-item
      prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
      title="John Leider"
      nav
    >
      <template #append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider />

    <v-list density="compact" nav>
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        :to="item.path"
        :prepend-icon="item.icon"
        :title="item.title"
        router
        exact
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MenuItem } from '~/types/menu-item.type'

defineProps<{
  items: MenuItem[]
}>()

const showMenu = ref(false)
const rail = ref(true)

function shrinkMenu() {
  rail.value = true
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

defineExpose({
  shrinkMenu,
  toggleMenu,
})
</script>
