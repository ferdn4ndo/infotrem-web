<script setup lang="ts">
import { FeedMediaItem } from '@/types/feed-media-item.type'

defineProps<{
  mediaItem: FeedMediaItem
}>()

function displayDate(inputDate: string | null) {
  return !inputDate ? '-DESCONHECIDO-' : inputDate
}

function getSubtitle() {
  // ToDo: process date
  return 'há 12 horas'
}
</script>

<template>
  <div class="FeedItem">
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

      <div class="FeedItem-Data">
        <div class="FeedItem-DataHeader">Informações da Foto</div>

        <dl class="FeedItem-DataList">
          <dt class="FeedItem-DataListTitle">Descri&ccedil;&atilde;o</dt>
          <dd class="FeedItem-DataListText">{{ mediaItem.description }}</dd>
        </dl>

        <dl class="FeedItem-DataList">
          <dt class="FeedItem-DataListTitle">Autor</dt>
          <dd class="FeedItem-DataListText">{{ mediaItem.author }}</dd>
        </dl>

        <dl class="FeedItem-DataList">
          <dt class="FeedItem-DataListTitle">Fonte</dt>
          <dd class="FeedItem-DataListText">
            <a :href="mediaItem.source" target="_blank" title="Link externo para a foto original"
              >Link externo</a
            >
          </dd>
        </dl>

        <dl class="FeedItem-DataList">
          <dt class="FeedItem-DataListTitle">Data</dt>
          <dd class="FeedItem-DataListText">{{ displayDate(mediaItem.mediaDate) }}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.FeedItem {
  margin: 20px;
  width: 80vw;

  &-ContentWrapper {
    display: flex;
    flex-wrap: wrap;
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
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    height: 100%;

    @media (min-width: $breakpoint-large) {
      flex: 0 0 40%;
      flex-wrap: wrap;
    }
  }

  &-DataList {
    margin: 0;
    padding: 0;
    display: flex;
    flex: 1 1 100%;
  }

  &-DataListTitle {
    margin: 0;
    padding: 10px 5px;
    font-weight: bold;
    border: 1px solid #fff;
    // flex: 0 0 7vw;
    width: 25vw;

    &::after {
      content: ':';
    }

    @media (min-width: $breakpoint-large) {
      // flex: 0 0 100%;
      max-width: 100px;
      width: 12vw;
    }
  }

  &-DataListText {
    margin: 0;
    padding: 10px 5px;
    border: 1px solid #fff;
    flex: 1 1 auto;
    width: 100%;

    @media (min-width: $breakpoint-large) {
      // flex: 0 0 100%;
      width: 100%;
    }
  }

  &-DataHeader {
    font-weight: bold;
    flex: 1 1 100%;
    text-align: center;
  }

  &-DataTitle {
    font-weight: bold;
  }

  &-DataText {
    font-weight: bold;
    word-wrap: wrap;
  }
}
</style>
