<template>
  <FeedList
    :items="feedItems"
  />
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import FeedList from '~/components/FeedList.vue'

import * as FeedService from '~/services/feed.service'
import { FeedMediaItem } from '~/types/feed-media-item.type'

useSeoMeta({
  title: 'Feed',
  ogTitle: 'Feed',
  description: 'This is my amazing site, let me tell you all about it.',
  ogDescription: 'This is my amazing site, let me tell you all about it.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})


const feedItems: Ref<FeedMediaItem[]> = ref([])
FeedService.getAll().then((serviceFeedItems) => {
  feedItems.value = serviceFeedItems
})
</script>
