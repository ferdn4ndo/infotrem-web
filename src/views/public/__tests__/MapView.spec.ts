import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MapView from '@/views/public/MapView.vue'

const mocks = vi.hoisted(() => {
  const markerHandlers: Record<string, (() => void) | undefined> = {}
  const mapHandlers: Record<string, (() => void) | undefined> = {}
  const marker = {
    bindTooltip: vi.fn(),
    on: vi.fn((event: string, handler: () => void) => {
      markerHandlers[event] = handler
      return marker
    }),
    addTo: vi.fn()
  }
  const markersLayer = {
    addTo: vi.fn(() => markersLayer),
    clearLayers: vi.fn()
  }
  const map = {
    getCenter: vi.fn(() => ({ lat: -23.55, lng: -46.63 })),
    getZoom: vi.fn(() => 8),
    on: vi.fn((event: string, handler: () => void) => {
      mapHandlers[event] = handler
      return map
    }),
    off: vi.fn((event: string, handler?: () => void) => {
      if (!handler || mapHandlers[event] === handler) {
        mapHandlers[event] = undefined
      }
      return map
    }),
    remove: vi.fn()
  }
  const tileLayerInstance = {
    addTo: vi.fn()
  }

  return {
    push: vi.fn(),
    getMapData: vi.fn(),
    routeForEntityRow: vi.fn((item: { entity_type: string; id?: string | null }) => ({
      label: item.entity_type,
      target: item.id ? `/resources/${item.entity_type}s/${item.id}` : null
    })),
    marker,
    markerHandlers,
    mapHandlers,
    markersLayer,
    map,
    tileLayer: vi.fn(() => tileLayerInstance),
    leafletMap: vi.fn(() => map),
    layerGroup: vi.fn(() => markersLayer)
  }
})

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: mocks.push })
  }
})

vi.mock('@/services/api/map.api', () => ({
  getMapData: mocks.getMapData
}))

vi.mock('@/services/api/entity-routing', () => ({
  routeForEntityRow: mocks.routeForEntityRow
}))

vi.mock('leaflet', () => ({
  map: mocks.leafletMap,
  marker: vi.fn(() => mocks.marker),
  tileLayer: mocks.tileLayer,
  layerGroup: mocks.layerGroup
}))

vi.mock('leaflet/dist/leaflet.css', () => ({}))

describe('MapView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
    mocks.getMapData.mockResolvedValue({
      items: [
        {
          id: 'location-1',
          entity_type: 'location',
          name: 'Pátio Central',
          latitude: -23.55,
          longitude: -46.63
        }
      ],
      bounds: {},
      query: {}
    })
  })

  it('loads map data and renders summary cards', async () => {
    const wrapper = mount(MapView, {
      global: {
        stubs: {
          AppCard: { template: '<div><slot /></div>' },
          StatusMessage: { props: ['message'], template: '<p>{{ message }}</p>' },
          EmptyState: { template: '<div />' },
          RoutableEntitySummaryCard: {
            template: '<article data-cy="map-result"><slot /></article>'
          }
        }
      }
    })

    await flushPromises()

    expect(mocks.getMapData).toHaveBeenCalledWith(
      {
        lat: -23.55,
        lng: -46.63,
        zoom: 8,
        width: 360,
        height: 320
      },
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    )
    expect(wrapper.text()).toContain('1 de 1 resultados possuem coordenadas.')
    expect(wrapper.findAll('[data-cy="map-result"]')).toHaveLength(1)
  })

  it('navigates to routed entity when marker is clicked', async () => {
    mount(MapView, {
      global: {
        stubs: {
          AppCard: { template: '<div><slot /></div>' },
          StatusMessage: { props: ['message'], template: '<p>{{ message }}</p>' },
          EmptyState: { template: '<div />' },
          RoutableEntitySummaryCard: { template: '<article><slot /></article>' }
        }
      }
    })

    await flushPromises()
    const markerClick = mocks.markerHandlers.click
    if (!markerClick) {
      throw new Error('Expected marker click handler to be registered')
    }

    markerClick()

    expect(mocks.push).toHaveBeenCalledWith('/resources/locations/location-1')
  })

  it('debounces moveend/zoomend refreshes', async () => {
    vi.useFakeTimers()
    mount(MapView, {
      global: {
        stubs: {
          AppCard: { template: '<div><slot /></div>' },
          StatusMessage: { props: ['message'], template: '<p>{{ message }}</p>' },
          EmptyState: { template: '<div />' },
          RoutableEntitySummaryCard: { template: '<article><slot /></article>' }
        }
      }
    })

    await flushPromises()
    expect(mocks.getMapData).toHaveBeenCalledTimes(1)

    const moveend = mocks.mapHandlers.moveend
    const zoomend = mocks.mapHandlers.zoomend
    if (!moveend || !zoomend) {
      throw new Error('Expected moveend/zoomend handlers to be registered')
    }

    moveend()
    zoomend()
    vi.advanceTimersByTime(299)
    await flushPromises()

    expect(mocks.getMapData).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1)
    await flushPromises()
    expect(mocks.getMapData).toHaveBeenCalledTimes(2)
  })
})
