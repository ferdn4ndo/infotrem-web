<script setup lang="ts">
import { FeedMediaItem } from '@/types/feed-media-item.type'
import FeedItem from '@/components/feed/FeedItem.vue'

defineProps<{
  items: FeedMediaItem[]
}>()
</script>

<template>
  <div class="FeedList">
    <FeedItem v-for="(item, i) in items" :key="i" :media-item="item" class="FeedList-Item" />
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.FeedList {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;

  &-Item {
    flex: 0 0 90%;

    @media (min-width: $breakpoint-large) {
      flex: 0 0 80vw;
    }
  }
}
</style>
