<template>
  <v-container class="FeedList w-100 ma-0 pa-0 d-flex flex-column align-center">
    <FeedItem
      v-for="(item, i) in items"
      :key="i"
      :title="item.title"
      :media-url="item.mediaUrl"
      :media-alt="item.mediaAlt"
      class="mx-10 mb-10"
      router
      exact
    />
  </v-container>
</template>

<script setup lang="ts">
import { FeedMediaItem } from '~/types/feed-media-item.type'
import FeedItem from '~/components/FeedItem.vue'

defineProps<{
  items: FeedMediaItem[]
}>()
</script>

<style lang="scss" scoped>
.FeedList {
  // max-width: 80vw;
}
</style>
