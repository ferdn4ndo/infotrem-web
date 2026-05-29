describe('InfoTrem integration smoke', () => {
  it('loads the SPA and reaches the API through the frontend proxy', () => {
    cy.visit('/')
    cy.get('#app').should('exist')
    cy.request('/api/health').its('status').should('eq', 200)
  })
})
