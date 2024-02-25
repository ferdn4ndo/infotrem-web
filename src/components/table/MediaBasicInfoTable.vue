<script setup lang="ts">
  import { type FeedMediaItem } from '@/types/feed-media-item.type'

  defineProps<{
    mediaItem: FeedMediaItem
  }>()

  function displayDate(inputDate: string | null) {
    return !inputDate ? '-DESCONHECIDO-' : inputDate
  }
</script>

<template>
  <div class="MediaBasicInfoTable">
    <div class="MediaBasicInfoTable-DataHeader">Informações da Foto</div>

    <dl class="MediaBasicInfoTable-DataList">
      <dt class="MediaBasicInfoTable-DataListTitle">Descri&ccedil;&atilde;o</dt>
      <dd class="MediaBasicInfoTable-DataListText">{{ mediaItem.description }}</dd>
    </dl>

    <dl class="MediaBasicInfoTable-DataList">
      <dt class="MediaBasicInfoTable-DataListTitle">Autor</dt>
      <dd class="MediaBasicInfoTable-DataListText">{{ mediaItem.author }}</dd>
    </dl>

    <dl class="MediaBasicInfoTable-DataList">
      <dt class="MediaBasicInfoTable-DataListTitle">Fonte</dt>
      <dd class="MediaBasicInfoTable-DataListText">
        <a :href="mediaItem.source" target="_blank" title="Link externo para a foto original"
          >Link externo</a
        >
      </dd>
    </dl>

    <dl class="MediaBasicInfoTable-DataList">
      <dt class="MediaBasicInfoTable-DataListTitle">Data</dt>
      <dd class="MediaBasicInfoTable-DataListText">{{ displayDate(mediaItem.mediaDate) }}</dd>
    </dl>
  </div>
</template>

<style lang="scss" scoped>
  @import '@/styles/variables.scss';

  .MediaBasicInfoTable {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    &-DataList {
      margin: 0;
      padding: 0;
      display: flex;
      flex: 1 1 100%;
    }

    &-DataListTitle {
      margin: 2px;
      padding: 10px 5px;
      font-weight: bold;
      background-color: var(--color-background-mute);
      width: 25vw;
      text-align: right;

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
      margin: 2px;
      padding: 10px 5px;
      background-color: var(--color-background-mute);
      flex: 1 1 auto;
      width: 100%;

      @media (min-width: $breakpoint-large) {
        width: 100%;
      }
    }

    &-DataHeader {
      font-weight: bold;
      background-color: var(--color-background-mute);
      margin: 2px;
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
