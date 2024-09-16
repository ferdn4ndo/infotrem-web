<template>
  <div class="TheCard">
    <slot>
      Content
    </slot>
  </div>
</template>

<style lang="scss" scoped>
  @import '@/styles/variables.scss';

  .TheCard {
    margin: 20px;
    width: 100%;
    padding: 5px 10px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background-color: var(--color-background-soft);

    @media (min-width: $breakpoint-large) {
      // flex: 0 0 100%;
      width: 80vw;
    }
  }
</style>
