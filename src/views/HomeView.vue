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
  padding: 24px;

  &-Links {
    display: grid;
    gap: 12px;
    margin-top: 24px;
  }
}
</style>
