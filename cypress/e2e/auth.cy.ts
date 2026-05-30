describe('auth smoke', () => {
  it('logs in, hydrates /me, and reaches the profile page', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.intercept('POST', '/api/login', { token: 'test-token' }).as('login')
      cy.stubMe(data.user)

      cy.visit('/login')
      cy.get('[data-cy="login-email"]').type(data.user.email)
      cy.get('[data-cy="login-password"]').type('password')
      cy.get('[data-cy="login-submit"]').click()

      cy.wait('@login')
      cy.wait('@me')
      cy.location('pathname').should('eq', '/me')
      cy.contains('Meu Perfil')
      cy.contains(data.user.email)
    })
  })

  it('redirects anonymous users from authenticated pages and honors redirect after login', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.intercept('POST', '/api/login', { token: 'test-token' }).as('login')
      cy.stubMe(data.user)

      cy.visit('/contact')
      cy.location('pathname').should('eq', '/login')
      cy.location('search').should('contain', 'redirect=%2Fcontact')

      cy.get('[data-cy="login-email"]').type(data.user.email)
      cy.get('[data-cy="login-password"]').type('password')
      cy.get('[data-cy="login-submit"]').click()

      cy.wait('@login')
      cy.location('pathname').should('eq', '/contact')
    })
  })
})
