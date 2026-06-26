describe('wave 3 shell and role-aware navigation', () => {
  it('shows overlay drawer behavior and role-gated admin links', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.user)

      cy.get('button[aria-label="Abrir menu"]').click()
      cy.get('.MainContent-Backdrop').should('exist')
      cy.contains('Feed')
      cy.get('body').should('not.contain', 'Administração')

      cy.get('.MainContent-Backdrop').click()
      cy.get('.MainContent-Backdrop').should('not.exist')

      cy.get('button[aria-label="Abrir menu"]').click()
      cy.get('body').type('{esc}')
      cy.get('.MainContent-Backdrop').should('not.exist')
    })
  })

  it('shows staff admin links and closes drawer after route navigation', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.staff)
      cy.intercept('GET', '/api/map*', {
        items: [],
        bounds: { north: -23.4, south: -23.7, east: -46.4, west: -46.8 },
        query: { lat: -23.55, lng: -46.63, zoom: 8 }
      })

      cy.get('button[aria-label="Abrir menu"]').click()
      cy.contains('Administração')
      cy.contains('Operações')
      cy.contains('Mapa').click()
      cy.location('pathname').should('eq', '/map')
      cy.get('.MainContent-Backdrop').should('not.exist')
    })
  })
})
