describe('media smoke', () => {
  it('renders the media list with backend data', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.intercept('GET', '/api/media*', {
        items: [data.media],
        count: 1,
        _links: { self: { href: '/api/media' } }
      }).as('mediaList')

      cy.visit('/media')
      cy.wait('@mediaList')
      cy.contains(data.media.title)
    })
  })

  it('renders media detail and supports social, comment, review, and download mutations', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.user)
      cy.stubEmptyCommonApi()
      cy.intercept('GET', '/api/media/media-1', data.media).as('media')
      cy.intercept('GET', '/api/media/media-1/social-summary', data.socialSummary).as('summary')
      cy.intercept('GET', '/api/media/media-1/comments', {
        items: [data.commentRelation],
        count: 1
      }).as('comments')
      cy.intercept('GET', '/api/media/media-1/reviews', { items: [data.review], count: 1 }).as(
        'reviews'
      )
      cy.intercept('GET', '/api/comments/comment-1/social-summary', data.commentSummary)
      cy.intercept('POST', '/api/media/media-1/likes', { id: 'like-1' }).as('like')
      cy.intercept('POST', '/api/media/media-1/favorites', { id: 'favorite-1' }).as('favorite')
      cy.intercept('POST', '/api/media/media-1/comments', data.commentRelation).as('comment')
      cy.intercept(
        'PATCH',
        '/api/media/media-1/comments/comment-relation-1',
        data.commentRelation
      ).as('commentEdit')
      cy.intercept('DELETE', '/api/media/media-1/comments/comment-relation-1', {
        statusCode: 204
      }).as('commentDelete')
      cy.intercept('POST', '/api/comments/comment-1/likes', { id: 'comment-like-1' }).as(
        'commentLike'
      )
      cy.intercept('POST', '/api/media/media-1/reviews', data.review).as('reviewCreate')
      cy.intercept('PATCH', '/api/media/media-1/reviews/review-1', data.review).as('reviewEdit')
      cy.intercept('DELETE', '/api/media/media-1/reviews/review-1', { statusCode: 204 }).as(
        'reviewDelete'
      )
      cy.intercept('POST', '/api/media/media-1/storages/storage-1/files/file-1/download', {
        download_id: 'download-1'
      }).as('download')

      cy.visit('/media/media-1')
      cy.wait('@media')
      cy.contains(data.media.title)
      cy.contains('1 curtidas')

      cy.get('[data-cy="media-like"]').click()
      cy.wait('@like')
      cy.get('[data-cy="media-favorite"]').click()
      cy.wait('@favorite')
      cy.get('[data-cy="media-download"]').click()
      cy.wait('@download')
      cy.contains('Abrir arquivo').should('have.attr', 'href').and('include', 'download-1')

      cy.get('[data-cy="media-comment-text"]').type('Novo comentário')
      cy.get('[data-cy="media-comment-submit"]').click()
      cy.wait('@comment')
      cy.get('[data-cy="comment-reply"]').first().click()
      cy.get('[data-cy="comment-reply-text"]').type('Resposta')
      cy.get('[data-cy="comment-reply-submit"]').click()
      cy.wait('@comment')
      cy.get('[data-cy="comment-edit"]').first().click()
      cy.get('[data-cy="comment-edit-text"]').clear().type('Comentário editado')
      cy.get('[data-cy="comment-edit-submit"]').click()
      cy.wait('@commentEdit')
      cy.get('[data-cy="comment-like"]').first().click()
      cy.wait('@commentLike')
      cy.get('[data-cy="comment-delete"]').first().click()
      cy.wait('@commentDelete')

      cy.get('[data-cy="media-review-decision"]').select('approve')
      cy.get('[data-cy="media-review-comment"]').type('Aprovado')
      cy.get('[data-cy="media-review-submit"]').click()
      cy.wait('@reviewCreate')
      cy.get('[data-cy="review-edit"]').first().click()
      cy.get('[data-cy="review-decision"]').select('needs_changes')
      cy.get('[data-cy="review-comment"]').clear().type('Ajustar fonte')
      cy.get('[data-cy="review-submit"]').click()
      cy.wait('@reviewEdit')
      cy.get('[data-cy="review-delete"]').first().click()
      cy.wait('@reviewDelete')
    })
  })

  it('creates media and uploads URL content through the default-storage endpoint', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.user)
      cy.intercept('POST', '/api/media', data.media).as('createMedia')
      cy.intercept('POST', '/api/media/media-1/upload-from-url', {
        id: 'media-file-1',
        filemgr_storage_id: 'storage-1'
      }).as('uploadUrl')
      cy.intercept('GET', '/api/media/media-1', data.media).as('reloadMedia')

      cy.visit('/upload/media')
      cy.get('[data-cy="media-title"]').type(data.media.title)
      cy.get('[data-cy="media-create-submit"]').click()
      cy.wait('@createMedia')
      cy.contains('Registro de mídia criado')

      cy.get('[data-cy="media-source-url"]').type('https://example.test/image.jpg')
      cy.get('[data-cy="media-url-submit"]').click()
      cy.wait('@uploadUrl')
      cy.contains('URL enviada para processamento')
    })
  })
})
