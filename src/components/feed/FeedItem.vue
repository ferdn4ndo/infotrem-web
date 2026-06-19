<script setup lang="ts">
import AppCard from '@/components/common/AppCard.vue'
import MediaBasicInfoTable from '@/components/table/MediaBasicInfoTable.vue'
import { toFallbackImage } from '@/services/api/media.api'
import { type FeedMediaItem } from '@/types/feed-media-item.type'

defineProps<{
  mediaItem: FeedMediaItem
}>()
</script>

<template>
  <AppCard class="FeedItem">
    <div class="FeedItem-Title">
      {{ mediaItem.title }}
    </div>

    <div class="FeedItem-SubTitle">
      {{ mediaItem.subtitle }}
    </div>

    <div class="FeedItem-ContentWrapper">
      <div class="FeedItem-Media">
        <img
          :src="mediaItem.mediaUrl"
          :alt="mediaItem.mediaAlt"
          class="FeedItem-Image"
          @error="toFallbackImage"
        />
      </div>

      <media-basic-info-table class="FeedItem-Data" :media-item="mediaItem" />
    </div>
  </AppCard>
</template>

<style lang="scss" scoped>
.FeedItem {
  &-Title {
    font-size: var(--font-size-lg);
    font-weight: bold;
    margin-bottom: calc(-1 * var(--space-1));
  }

  &-SubTitle {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  &-ContentWrapper {
    display: flex;
    flex-wrap: wrap;
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-2);
    margin-top: var(--space-1);
    justify-content: space-between;
  }

  &-Media {
    flex: 0 0 100%;

    @media (min-width: $breakpoint-large) {
      flex: 0 0 60%;
    }
  }

  &-Image {
    width: 100%;
  }

  &-Data {
    flex: 0 0 100%;
    height: 100%;

    @media (min-width: $breakpoint-large) {
      flex: 0 0 39%;
    }
  }
}
</style>
