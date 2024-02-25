<script setup lang="ts">
  import TheCard from '@/components/layout/TheCard.vue'
  import MediaBasicInfoTable from '@/components/table/MediaBasicInfoTable.vue'
  import { type FeedMediaItem } from '@/types/feed-media-item.type'

  defineProps<{
    mediaItem: FeedMediaItem
  }>()

  function getSubtitle() {
    // ToDo: process date
    return 'há 12 horas'
  }
</script>

<template>
  <the-card class="FeedItem">
    <div class="FeedItem-Title">
      {{ mediaItem.title }}
    </div>

    <div class="FeedItem-SubTitle">
      {{ getSubtitle() }}
    </div>

    <div class="FeedItem-ContentWrapper">
      <div class="FeedItem-Media">
        <img :src="mediaItem.mediaUrl" :alt="mediaItem.mediaAlt" class="FeedItem-Image" />
      </div>

      <media-basic-info-table class="FeedItem-Data" :media-item="mediaItem" />
    </div>
  </the-card>
</template>

<style lang="scss" scoped>
  @import '@/styles/variables.scss';

  .FeedItem {
    &-Title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: -4px;
    }

    &-SubTitle {
      font-size: 10px;
      color: var(--color-text-secondary);
    }

    &-ContentWrapper {
      display: flex;
      flex-wrap: wrap;
      border-top: 1px solid var(--color-border);
      padding-top: 10px;
      margin-top: 5px;
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
