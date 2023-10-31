<template>
  <v-card class="FeedItem">
    <v-card-title>
      {{ title }}
    </v-card-title>

    <v-card-subtitle>
      {{ description }}
    </v-card-subtitle>

    <v-card-text class="pa-0 d-flex">
      <img
        :src="mediaUrl"
        :alt="mediaAlt"
        class="FeedItem-Image flex-fill"
      />
    </v-card-text>
  </v-card>

</template>

<script setup lang="ts">
defineProps<{
  title: string,
  description: string,
  mediaUrl: string,
  mediaAlt: string,
}>()
</script>


<style lang="scss" scoped>
.FeedItem {
  margin: 20px;
  max-width: 800px;

  &-Image {
    width: 100%;
  }
}
</style>
