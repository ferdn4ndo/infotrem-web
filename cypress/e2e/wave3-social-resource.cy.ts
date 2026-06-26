describe('wave 3 threaded comments and vote read-back', () => {
  it('renders threaded media comments with collapsed deep replies', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.user)
      cy.stubEmptyCommonApi()

      cy.intercept('GET', '/api/media/media-1', data.media).as('media')
      cy.intercept('GET', '/api/media/media-1/social-summary', data.socialSummary)
      cy.intercept('GET', '/api/comments/*/social-summary', {
        likes_count: 0,
        liked: false,
        like_id: null
      })
      cy.intercept('GET', '/api/media/media-1/comments*', {
        items: [
          {
            id: 'join-1',
            comment_id: 'comment-1',
            comment: {
              id: 'comment-1',
              text: 'Root comment',
              created_by_id: 'user-1',
              created_at: '2026-01-01T00:00:00Z'
            }
          },
          {
            id: 'join-2',
            comment_id: 'comment-2',
            comment: {
              id: 'comment-2',
              text: 'Reply level 1',
              replies_to_id: 'comment-1',
              created_by_id: 'user-2',
              created_at: '2026-01-01T00:01:00Z'
            }
          },
          {
            id: 'join-3',
            comment_id: 'comment-3',
            comment: {
              id: 'comment-3',
              text: 'Reply level 2',
              replies_to_id: 'comment-2',
              created_by_id: 'user-3',
              created_at: '2026-01-01T00:02:00Z'
            }
          },
          {
            id: 'join-4',
            comment_id: 'comment-4',
            comment: {
              id: 'comment-4',
              text: 'Reply level 3',
              replies_to_id: 'comment-3',
              created_by_id: 'user-4',
              created_at: '2026-01-01T00:03:00Z'
            }
          }
        ],
        count: 4
      }).as('comments')

      cy.visit('/media/media-1')
      cy.wait('@media')
      cy.wait('@comments')

      cy.contains('Root comment')
      cy.contains('Reply level 1')
      cy.contains('Reply level 2')
      cy.contains('Resposta em thread')
      cy.contains('resposta(s) adicional(is) ocultas')
      cy.get('[data-cy="comment-expand-replies"]').click()
      cy.contains('Reply level 3')
      cy.get('[data-cy="comment-expand-replies"]').click()
      cy.contains('Reply level 3').should('not.exist')
    })
  })

  it('reads back information vote summary and current user vote from summary endpoint', () => {
    cy.fixture('api-smoke').then((data) => {
      let summaryCall = 0

      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.user)

      cy.intercept('GET', '/api/information/info-1', {
        id: 'info-1',
        title: 'Informação de teste',
        description: 'Descrição'
      }).as('information')
      cy.intercept('GET', '/api/information/info-1/effects*', {
        items: [],
        count: 0
      })
      cy.intercept('GET', '/api/information/info-1/summary', () => {
        summaryCall += 1
        if (summaryCall === 1) {
          return {
            vote_summary: { up_count: 3, neutral_count: 2, down_count: 1, total_count: 6 },
            current_user_vote: { value: 1 },
            effects: []
          }
        }

        return {
          vote_summary: { up_count: 3, neutral_count: 2, down_count: 2, total_count: 7 },
          current_user_vote: { value: -1 },
          effects: []
        }
      }).as('summary')
      cy.intercept('POST', '/api/information/info-1/votes', { id: 'vote-1', value: -1 }).as('vote')

      cy.visit('/resources/information/info-1')
      cy.wait('@information')
      cy.wait('@summary')
      cy.contains('6 voto(s): 3 concordam, 2 neutros, 1 discordam.')
      cy.contains('Seu voto: 1')

      cy.contains('button', 'Discordo').click()
      cy.wait('@vote')
      cy.wait('@summary')
      cy.contains('7 voto(s): 3 concordam, 2 neutros, 2 discordam.')
      cy.contains('Seu voto: -1')
    })
  })
})
