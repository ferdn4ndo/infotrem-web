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
.FeedList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);

  &-Item {
    min-width: 0;
  }
}
</style>
