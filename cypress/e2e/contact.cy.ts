describe('contact smoke', () => {
  it('requires auth and submits an authenticated contact message', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/contact')
      cy.location('pathname').should('eq', '/login')

      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.user)
      cy.intercept('POST', '/api/contact', {
        id: 'contact-1',
        message: 'Mensagem enviada'
      }).as('contact')

      cy.visit('/contact')
      cy.get('[data-cy="contact-message"]').type('Preciso corrigir um dado.')
      cy.get('[data-cy="contact-submit"]').click()
      cy.wait('@contact')
      cy.contains('Mensagem enviada.')
    })
  })
})
