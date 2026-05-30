describe('admin smoke', () => {
  it('blocks non-staff users from admin resources', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('infotrem.authToken', 'test-token')
      }
    })
    cy.stubMe({ is_staff: false, is_admin: false })

    cy.visit('/admin/resources/mail')
    cy.location('pathname').should('eq', '/')
  })

  it('allows admins to create, edit, and delete a generic resource through intercepted calls', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.admin)
      cy.intercept('GET', '/api/users*', {
        items: [data.admin],
        count: 1,
        _links: { self: { href: '/api/users' } }
      }).as('users')
      cy.intercept('POST', '/api/users', data.admin).as('createUser')
      cy.intercept('PATCH', '/api/users/admin-1', data.admin).as('updateUser')
      cy.intercept('DELETE', '/api/users/admin-1', { statusCode: 204 }).as('deleteUser')

      cy.visit('/admin/resources/users')
      cy.wait('@users')
      cy.contains('Administração: Usuários')

      cy.get('[data-cy="admin-new"]').click()
      cy.get('[data-cy="admin-editor"]').within(() => {
        cy.contains('label', 'email').find('input').type('new-admin@example.test')
        cy.contains('label', 'username').find('input').type('new-admin')
        cy.get('[data-cy="admin-submit"]').click()
      })
      cy.wait('@createUser')

      cy.get('[data-cy="admin-row"]').first().click()
      cy.get('[data-cy="admin-editor"]').within(() => {
        cy.contains('label', 'name').find('input').clear().type('Updated Admin')
        cy.get('[data-cy="admin-submit"]').click()
      })
      cy.wait('@updateUser')

      cy.get('[data-cy="admin-delete"]').first().click()
      cy.get('[data-cy="admin-confirm-delete"]').click()
      cy.wait('@deleteUser')
    })
  })
})
