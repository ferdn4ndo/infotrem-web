<template>
  <v-navigation-drawer
    v-model="showProfile"
    location="right"
    temporary
    fixed
  >
    <v-btn icon @click.stop="showProfile = false">
      <v-icon>fas fa-close</v-icon>
    </v-btn>

    <v-list>
      <v-list-item>
        <v-list-item-action>
          <v-icon light> mdi-repeat </v-icon>
        </v-list-item-action>
        <v-list-item-title>Switch drawer</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// const props = defineProps<{
//   isVisible: boolean
// }>();

const showProfile = ref(false);

function toggleSideBar() {
  showProfile.value = !showProfile.value
}

defineExpose({
  toggleSideBar
});
</script>

