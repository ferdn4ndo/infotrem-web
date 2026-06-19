<script setup lang="ts">
import type { FeedMediaItem } from '@/types/feed-media-item.type'
import FeedItem from '@/components/feed/FeedItem.vue'

defineProps<{
  items: FeedMediaItem[]
}>()

function feedItemKey(item: FeedMediaItem) {
  return `${item.mediaUrl || 'no-url'}::${item.title || 'untitled'}::${item.source || 'no-source'}`
}
</script>

<template>
  <div class="FeedList">
    <FeedItem
      v-for="item in items"
      :key="feedItemKey(item)"
      :media-item="item"
      class="FeedList-Item"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as vars;

.FeedList {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;

  &-Item {
    flex: 0 0 90%;

    @media (min-width: vars.$breakpoint-large) {
      flex: 0 0 80vw;
    }
  }
}
</style>
