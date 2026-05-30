/// <reference types="cypress" />

type CurrentUserFixture = {
  id: string
  email: string
  username?: string
  name?: string
  is_staff?: boolean
  is_admin?: boolean
}

declare global {
  namespace Cypress {
    interface Chainable {
      paginated(items?: unknown[]): Chainable<{
        items: unknown[]
        count: number
        _links: { self: { href: string } }
      }>
      seedAuth(user?: Partial<CurrentUserFixture>): Chainable<void>
      stubMe(user?: Partial<CurrentUserFixture>, statusCode?: number): Chainable<void>
      stubEmptyCommonApi(): Chainable<void>
    }
  }
}

const authTokenKey = 'infotrem.authToken'
const defaultUser: CurrentUserFixture = {
  id: 'user-1',
  email: 'user@example.test',
  username: 'infotrem-user',
  name: 'InfoTrem User',
  is_staff: false,
  is_admin: false
}

Cypress.Commands.add('paginated', (items: unknown[] = []) =>
  cy.wrap({
    items,
    count: items.length,
    _links: { self: { href: '/api/test' } }
  })
)

Cypress.Commands.add('stubMe', (user: Partial<CurrentUserFixture> = {}, statusCode = 200) => {
  cy.intercept('GET', '/api/me', {
    statusCode,
    body: statusCode >= 400 ? { detail: 'Unauthorized' } : { ...defaultUser, ...user }
  }).as('me')
})

Cypress.Commands.add('seedAuth', (user: Partial<CurrentUserFixture> = {}) => {
  cy.stubMe(user)
  cy.window().then((window) => {
    window.localStorage.setItem(authTokenKey, 'test-token')
  })
})

Cypress.Commands.add('stubEmptyCommonApi', () => {
  const empty = { items: [], count: 0, _links: { self: { href: '/api/test' } } }

  cy.intercept('GET', '/api/media/*/images*', empty)
  cy.intercept('GET', '/api/media/*/image-sizes*', empty)
  cy.intercept('GET', '/api/media/*/videos*', empty)
  cy.intercept('GET', '/api/media/*/documents*', empty)
  cy.intercept('GET', '/api/media/*/albums*', empty)
  cy.intercept('GET', '/api/media/*/rolling-stock*', empty)
  cy.intercept('GET', '/api/albums/*/media*', empty)
})

export {}
