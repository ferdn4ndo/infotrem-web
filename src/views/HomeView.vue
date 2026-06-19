<template>
  <main class="HomeView">
    <h1>InfoTrem</h1>
    <p>Explore mídia, rotas, locais, material rodante e informações ferroviárias.</p>
    <nav class="HomeView-Links">
      <RouterLink to="/feed">Feed de mídia</RouterLink>
      <RouterLink to="/search">Busca</RouterLink>
      <RouterLink to="/map">Mapa</RouterLink>
      <RouterLink to="/resources/rolling-stock">Material rodante</RouterLink>
      <RouterLink to="/resources/locations">Locais</RouterLink>
      <RouterLink to="/resources/routes">Rotas</RouterLink>
    </nav>
  </main>
</template>

<style scoped lang="scss">
.HomeView {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-4);

  &-Links {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-5);
  }

  @media (max-width: $breakpoint-medium) {
    padding: var(--space-3);
  }
}
</style>
