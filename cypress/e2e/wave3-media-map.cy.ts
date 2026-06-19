describe('wave 3 media + map intercept coverage', () => {
  it('renders media and album thumbnails and paginates list views', () => {
    cy.fixture('api-smoke').then((data) => {
      const mediaItems = Array.from({ length: 25 }, (_, index) => ({
        ...data.media,
        id: `media-${index + 1}`,
        title: `Mídia ${index + 1}`,
        thumbnail_url: `https://cdn.example.test/media-${index + 1}.jpg`
      }))
      const albumItems = Array.from({ length: 25 }, (_, index) => ({
        ...data.album,
        id: `album-${index + 1}`,
        title: `Álbum ${index + 1}`
      }))

      cy.intercept('GET', '/api/media*', (req) => {
        const offset = Number(req.query.offset ?? 0)
        const items = offset >= 24 ? mediaItems.slice(24) : mediaItems.slice(0, 24)

        req.reply({
          items,
          count: mediaItems.length,
          _links: { self: { href: '/api/media' } }
        })
      }).as('mediaList')
      cy.intercept('GET', '/api/albums*', (req) => {
        const offset = Number(req.query.offset ?? 0)
        const items = offset >= 24 ? albumItems.slice(24) : albumItems.slice(0, 24)

        req.reply({
          items,
          count: albumItems.length,
          _links: { self: { href: '/api/albums' } }
        })
      }).as('albumList')
      cy.intercept('GET', '/api/albums/*/media*', (req) => {
        const albumId = String(req.url.match(/\/api\/albums\/([^/]+)\/media/)?.[1] ?? 'album')
        req.reply({
          items: [
            {
              ...data.media,
              id: `cover-${albumId}`,
              thumbnail_url: `https://cdn.example.test/${albumId}-cover.jpg`
            }
          ],
          count: 1
        })
      }).as('albumMedia')

      cy.visit('/media')
      cy.wait('@mediaList')
      cy.get('img[alt="Mídia 1"]').should('have.attr', 'src').and('include', 'media-1.jpg')
      cy.contains('button', 'Próxima').click()
      cy.wait('@mediaList').its('request.query.offset').should('eq', '24')
      cy.contains('Página 2 de 2')

      cy.visit('/albums')
      cy.wait('@albumList')
      cy.wait('@albumMedia')
      cy.get('img[alt="Capa do álbum Álbum 1"]')
        .should('have.attr', 'src')
        .and('include', 'album-1-cover.jpg')
      cy.contains('button', 'Próxima').click()
      cy.wait('@albumList').its('request.query.offset').should('eq', '24')
      cy.contains('Página 2 de 2')
    })
  })

  it('renders media and album detail previews', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.visit('/', {
        onBeforeLoad(win) {
          win.localStorage.setItem('infotrem.authToken', 'test-token')
        }
      })
      cy.stubMe(data.user)

      cy.intercept('GET', '/api/media/media-1', {
        ...data.media,
        type: 'image',
        thumbnail_url: 'https://cdn.example.test/media-detail.jpg'
      }).as('media')
      cy.intercept('GET', '/api/media/media-1/social-summary', data.socialSummary)
      cy.stubEmptyCommonApi()
      cy.intercept('GET', '/api/media/media-1/images*', {
        items: [{ id: 'image-1', thumbnail_url: 'https://cdn.example.test/media-image.jpg' }],
        count: 1
      })

      cy.visit('/media/media-1')
      cy.wait('@media')
      cy.get('.MediaDetailView-PreviewMedia')
        .should('have.attr', 'src')
        .and('include', 'media-image.jpg')

      cy.intercept('GET', '/api/albums/album-1', data.album).as('album')
      cy.intercept('GET', '/api/albums/album-1/social-summary', data.socialSummary)
      cy.intercept('GET', '/api/albums/album-1/media*', {
        items: [{ id: 'album-media-1', title: 'Capa', thumbnail_url: 'https://cdn.example.test/cover.jpg' }],
        count: 1
      })
      cy.intercept('GET', '/api/albums/album-1/comments*', { items: [], count: 0 })

      cy.visit('/albums/album-1')
      cy.wait('@album')
      cy.get('.AlbumDetailView-Cover').should('have.attr', 'src').and('include', 'cover.jpg')
    })
  })

  it('renders map markers, refetches on zoom, and navigates on marker click', () => {
    cy.fixture('api-smoke').then((data) => {
      cy.intercept('GET', '/api/map*', {
        items: data.mapItems,
        bounds: { north: -23.4, south: -23.7, east: -46.4, west: -46.8 },
        query: { lat: -23.55, lng: -46.63, zoom: 8 }
      }).as('map')

      cy.visit('/map')
      cy.wait('@map')
      cy.contains('1 de 1 resultados')
      cy.get('[data-cy="map-result"]').should('contain', 'Pátio Central')

      cy.get('.leaflet-control-zoom-in').click()
      cy.wait('@map')

      cy.get('.leaflet-marker-icon').first().click({ force: true })
      cy.location('pathname').should('eq', '/resources/locations/location-1')
    })
  })
})
