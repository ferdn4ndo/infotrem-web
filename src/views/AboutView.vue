<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface AboutLink {
  label: string
  to: string
}

const links: AboutLink[] = [
  { label: 'Feed', to: '/feed' },
  { label: 'Mapa', to: '/map' },
  { label: 'Buscar', to: '/search' }
]
</script>

<template>
  <main class="AboutView">
    <h1 class="AboutView-Title">InfoTrem</h1>
    <p class="AboutView-Text">
      O InfoTrem e um aplicativo colaborativo de informacoes e midias sobre as ferrovias
      brasileiras, com foco em material rodante, rotas e locais.
    </p>
    <p class="AboutView-Text">
      Aqui a comunidade consulta registros historicos, acompanha novas contribuicoes e ajuda a
      manter o acervo ferroviario sempre atualizado.
    </p>
    <nav class="AboutView-Links" aria-label="Atalhos principais do InfoTrem">
      <RouterLink v-for="link in links" :key="link.to" class="AboutView-Link" :to="link.to">
        {{ link.label }}
      </RouterLink>
    </nav>
  </main>
</template>

<style lang="scss" scoped>
.AboutView {
  max-width: 720px;
  margin: 0 auto;
  padding: $space-6 $space-4;

  &-Title {
    font-size: $font-size-2xl;
    color: var(--color-heading);
    margin: 0 0 $space-4;
  }

  &-Text {
    font-size: $font-size-md;
    line-height: $line-height-base;
    color: var(--color-text);
    margin: 0 0 $space-3;
  }

  &-Links {
    display: grid;
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
    margin-top: $space-4;
  }

  &-Link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    padding: $space-2 $space-4;
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    background-color: var(--color-primary-normal);
    color: var(--color-heading);
    text-decoration: none;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      border-color: var(--color-primary-border);
      background-color: var(--color-primary-hover);
    }

    &:focus-visible {
      outline: 2px solid var(--color-primary-border);
      outline-offset: 2px;
    }
  }
}
</style>
