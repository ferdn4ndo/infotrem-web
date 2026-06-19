describe('wave 4 ui completion flows', () => {
  it('covers generic resource create/edit/delete and relation add/remove', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.staff)

      cy.intercept('GET', '/api/resources/manufacturers*', { items: [], count: 0 })
      cy.intercept('GET', '/api/manufacturers*', {
        items: [{ id: 'manufacturer-1', full_name: 'Fabricante 1', short_name: 'F1' }],
        count: 1
      }).as('manufacturers')
      cy.intercept('POST', '/api/manufacturers', {
        id: 'manufacturer-2',
        full_name: 'Fabricante 2',
        short_name: 'F2'
      }).as('createManufacturer')
      cy.intercept('PATCH', '/api/manufacturers/manufacturer-1', {
        id: 'manufacturer-1',
        full_name: 'Fabricante 1 editado',
        short_name: 'F1'
      }).as('updateManufacturer')
      cy.intercept('DELETE', '/api/manufacturers/manufacturer-1', { statusCode: 204 }).as(
        'deleteManufacturer'
      )
      cy.intercept('GET', '/api/manufacturers/manufacturer-1', {
        id: 'manufacturer-1',
        full_name: 'Fabricante 1',
        short_name: 'F1'
      })
      cy.intercept('GET', '/api/manufacturers/manufacturer-1/information*', { items: [], count: 0 }).as(
        'relationList'
      )
      cy.intercept('POST', '/api/manufacturers/manufacturer-1/information', { id: 'info-link-1' }).as(
        'relationAdd'
      )
      cy.intercept('DELETE', '/api/manufacturers/manufacturer-1/information/info-link-1', {
        statusCode: 204
      }).as(
        'relationDelete'
      )

      cy.visit('/resources/manufacturers')
      cy.wait('@manufacturers')
      cy.contains('button', 'Novo').click()
      cy.contains('button', 'Criar').click()
      cy.wait('@createManufacturer')

      cy.visit('/resources/manufacturers/manufacturer-1')
      cy.contains('button', 'Editar').first().click()
      cy.contains('button', 'Salvar alterações').click()
      cy.wait('@updateManufacturer')
      cy.contains('button', 'Excluir').first().click()
      cy.contains('button', 'Excluir').last().click()
      cy.wait('@deleteManufacturer')

      cy.wait('@relationList')
      cy.get('[data-cy="relation-add"]').first().click()
      cy.get('[data-cy="relation-create-form"]').contains('button', 'Criar').click()
      cy.wait('@relationAdd')
      cy.get('[data-cy="relation-delete"]').first().click()
      cy.contains('button', 'Excluir').last().click()
      cy.wait('@relationDelete')
    })
  })

  it('navigates route tree and opens section detail', () => {
    cy.intercept('GET', '/api/routes/route-1/tree', {
      route: { id: 'route-1', name: 'Rota Norte' },
      sections: [{ id: 'section-1', name: 'Trecho 1', locations: [], paths: [], points: [] }]
    }).as('routeTree')
    cy.intercept('GET', '/api/routes/route-1/sections/section-1', {
      id: 'section-1',
      name: 'Trecho 1'
    }).as('section')
    cy.intercept('GET', '/api/routes/route-1/sections/section-1/**', { items: [], count: 0 })

    cy.visit('/routes/route-1')
    cy.wait('@routeTree')
    cy.get('[data-cy="route-tree-open-section"]').first().click()
    cy.location('pathname').should('eq', '/routes/route-1/sections/section-1')
    cy.wait('@section')
  })

  it('manages sigo-series relation from information detail', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.staff)

      cy.intercept('GET', '/api/information/info-1', {
        id: 'info-1',
        title: 'Informação',
        description: 'Texto'
      })
      cy.intercept('GET', '/api/information/info-1/summary', {
        vote_summary: { up_count: 0, neutral_count: 0, down_count: 0, total_count: 0 },
        current_user_vote: null,
        effects: []
      })
      cy.intercept('GET', '/api/information/info-1/sigo-series*', { items: [], count: 0 }).as('sigoSeries')
      cy.intercept('POST', '/api/information/info-1/sigo-series', {
        id: 'series-1',
        sigo_number: 10
      }).as('createSeries')

      cy.visit('/resources/information/info-1')
      cy.wait('@sigoSeries')
      cy.get('[data-cy="relation-add"]').contains('Adicionar').click()
      cy.get('[data-cy="relation-create-form"]').contains('button', 'Criar').click()
      cy.wait('@createSeries')
    })
  })

  it('renders bespoke company/location/rolling-stock detail views', () => {
    cy.intercept('GET', '/api/companies/company-1/summary', {
      company: { id: 'company-1', name: 'Companhia Teste', abbrev: 'CT' },
      information: [],
      paint_schemes: []
    }).as('companySummary')
    cy.intercept('GET', '/api/locations/location-1/summary', {
      location: { id: 'location-1', name: 'Pátio', center_latitude: -23.5, center_longitude: -46.6 },
      information: [],
      track_gauges: [],
      paths: []
    }).as('locationSummary')
    cy.intercept('GET', '/api/map*', { items: [], bounds: null, query: null })
    cy.intercept('GET', '/api/rolling-stock/rolling-1/summary', {
      rolling_stock: { id: 'rolling-1', painted_identifier: 'RS-01' },
      media: [],
      information: []
    }).as('rollingSummary')

    cy.visit('/companies/company-1')
    cy.wait('@companySummary')
    cy.contains('Companhia Teste')

    cy.visit('/locations/location-1')
    cy.wait('@locationSummary')
    cy.contains('Pátio')

    cy.visit('/rolling-stock/rolling-1')
    cy.wait('@rollingSummary')
    cy.contains('RS-01')
  })

  it('uses aggregate media detail and links feed to media detail', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.intercept('GET', '/api/media/media-1/detail', {
        media: data.media,
        social_summary: data.socialSummary,
        images: [{ id: 'image-1', thumbnail_url: 'https://cdn.example.test/img.jpg' }],
        comments: [],
        reviews: []
      }).as('mediaDetail')
      cy.intercept('GET', '/api/feed*', {
        items: [{ id: 'media-1', title: 'Locomotiva em teste', entity_type: 'media' }],
        count: 1
      }).as('feed')

      cy.visit('/feed')
      cy.wait('@feed')
      cy.contains('Locomotiva em teste').click()
      cy.location('pathname').should('eq', '/media/media-1')
      cy.wait('@mediaDetail')
      cy.get('.MediaDetailView-PreviewMedia').should('exist')
    })
  })

  it('lists and moderates global media reviews queue', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.staff)

      cy.intercept('GET', '/api/media-reviews*', {
        items: [
          {
            id: 'review-1',
            media_item_id: 'media-1',
            decision: 'needs_changes',
            comment: 'Ajustar metadados',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T01:00:00Z'
          }
        ],
        count: 1
      }).as('moderationQueue')
      cy.intercept('PATCH', '/api/media/media-1/reviews/review-1', {
        id: 'review-1',
        decision: 'approve'
      }).as('approveReview')

      cy.visit('/admin/review-moderation')
      cy.wait('@moderationQueue')
      cy.get('[data-cy="moderation-row"]').should('contain', '#media-1')
      cy.get('[data-cy="moderation-approve"]').click()
      cy.wait('@approveReview')
    })
  })
})
