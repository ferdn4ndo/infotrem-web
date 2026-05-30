describe('album smoke', () => {
  it('renders the album list with backend data', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.intercept('GET', '/api/albums*', {
        items: [data.album],
        count: 1,
        _links: { self: { href: '/api/albums' } }
      }).as('albumList')

      cy.visit('/albums')
      cy.wait('@albumList')
      cy.contains(data.album.title)
    })
  })

  it('renders album detail and supports social and comment flows', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.user)
      cy.stubEmptyCommonApi()
      cy.intercept('GET', '/api/albums/album-1', data.album).as('album')
      cy.intercept('GET', '/api/albums/album-1/social-summary', data.socialSummary).as('summary')
      cy.intercept('GET', '/api/albums/album-1/comments', {
        items: [data.commentRelation],
        count: 1
      }).as('comments')
      cy.intercept('GET', '/api/comments/comment-1/social-summary', data.commentSummary)
      cy.intercept('POST', '/api/albums/album-1/likes', { id: 'like-1' }).as('like')
      cy.intercept('POST', '/api/albums/album-1/favorites', { id: 'favorite-1' }).as('favorite')
      cy.intercept('POST', '/api/albums/album-1/comments', data.commentRelation).as('comment')
      cy.intercept(
        'PATCH',
        '/api/albums/album-1/comments/comment-relation-1',
        data.commentRelation
      ).as('commentEdit')
      cy.intercept('DELETE', '/api/albums/album-1/comments/comment-relation-1', {
        statusCode: 204
      }).as('commentDelete')

      cy.visit('/albums/album-1')
      cy.wait('@album')
      cy.contains(data.album.title)
      cy.get('[data-cy="album-like"]').click()
      cy.wait('@like')
      cy.get('[data-cy="album-favorite"]').click()
      cy.wait('@favorite')

      cy.get('[data-cy="album-comment-text"]').type('Comentário no álbum')
      cy.get('[data-cy="album-comment-submit"]').click()
      cy.wait('@comment')
      cy.get('[data-cy="comment-edit"]').first().click()
      cy.get('[data-cy="comment-edit-text"]').clear().type('Comentário editado')
      cy.get('[data-cy="comment-edit-submit"]').click()
      cy.wait('@commentEdit')
      cy.get('[data-cy="comment-delete"]').first().click()
      cy.wait('@commentDelete')
    })
  })
})
