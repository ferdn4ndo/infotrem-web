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
.MediaBasicInfoTable {
  display: grid;
  gap: var(--space-1);

  &-DataList {
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: minmax(8rem, 12rem) 1fr;
    gap: var(--space-1);

    @media (max-width: $breakpoint-small) {
      grid-template-columns: 1fr;
    }
  }

  &-DataListTitle {
    margin: 0;
    padding: var(--space-2) var(--space-2);
    font-weight: bold;
    background-color: var(--color-background-mute);
    text-align: right;

    &::after {
      content: ':';
    }

    @media (max-width: $breakpoint-small) {
      text-align: left;
    }
  }

  &-DataListText {
    margin: 0;
    padding: var(--space-2) var(--space-2);
    background-color: var(--color-background-mute);
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &-DataHeader {
    font-weight: bold;
    background-color: var(--color-background-mute);
    margin: 0;
    padding: var(--space-2) var(--space-2);
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
