describe('search and map smoke', () => {
  it('shows search results and navigates to routed entities', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.intercept('GET', '/api/search*', {
        q: 'locomotiva',
        items: data.searchItems
      }).as('search')

      cy.visit('/search')
      cy.get('[data-cy="search-input"]').type('locomotiva')
      cy.get('[data-cy="search-submit"]').click()
      cy.wait('@search')

      cy.get('[data-cy="search-result"]').should('have.length', 2)
      cy.contains('Locomotiva em teste')
      cy.contains('Seção A')
      cy.get('[data-cy="search-result"]').first().click()
      cy.location('pathname').should('eq', '/media/media-1')
    })
  })

  it('shows map rows with normalized coordinates and routable links', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.intercept('GET', '/api/map*', {
        items: data.mapItems,
        bounds: { north: -23.4, south: -23.7, east: -46.4, west: -46.8 },
        query: { lat: -23.55, lng: -46.63, zoom: 8 }
      }).as('map')

      cy.visit('/map')
      cy.wait('@map')
      cy.contains('1 de 1 resultados')
      cy.get('[data-cy="map-result"]').should('contain', 'Pátio Central')
      cy.get('[data-cy="map-submit"]').click()
      cy.wait('@map')
    })
  })
})
