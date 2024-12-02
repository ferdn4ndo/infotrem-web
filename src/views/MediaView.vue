<script setup lang="ts">
import { Ref, ref } from 'vue'
import FeedList from '../components/feed/FeedList.vue'

import * as FeedService from '@/services/feed.service'
import type { FeedMediaItem } from '@/types/feed-media-item.type'

const feedItems: Ref<FeedMediaItem[]> = ref([])
FeedService.getAll().then((serviceFeedItems) => {
  feedItems.value = serviceFeedItems
})
</script>

<template>
  <main>
    <feed-list :items="feedItems" />
  </main>
</template>
