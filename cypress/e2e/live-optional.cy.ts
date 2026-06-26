const liveEnabled = Boolean(Cypress.env('LIVE') || Cypress.env('live'))
const describeLive = liveEnabled ? describe : describe.skip

describeLive('optional live integration smoke', () => {
  it('loads public pages against a live API', () => {
    cy.visit('/media')
    cy.contains('h1', 'Mídia')

    cy.visit('/albums')
    cy.contains('h1', 'Álbuns')

    cy.visit('/map')
    cy.contains('h1', 'Mapa')
    cy.get('[data-cy="map-canvas"]').should('exist')
  })
})
