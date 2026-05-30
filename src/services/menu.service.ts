import type { MenuItem } from '~/types/menu-item.type'
import type { MenuList } from '~/types/meny-list.type'

const items: MenuList = {
  1: {
    id: 1,
    icon: 'fa-home',
    title: 'Home',
    path: '/',
    children: null
  },
  2: {
    id: 2,
    icon: 'fa-rss',
    title: 'Feed',
    path: '/feed',
    children: null
  },
  3: {
    id: 3,
    icon: 'fa-train',
    title: 'Material Rodante',
    path: null,
    children: {
      1: {
        id: 3,
        icon: 'fa-gears',
        title: 'Locomotivas',
        path: '/resources/locomotives',
        children: null
      }
    }
  },
  4: {
    id: 4,
    icon: 'fa-photo-film',
    title: 'Mídia',
    path: null,
    children: {
      1: {
        id: 41,
        icon: 'fa-photo-film',
        title: 'Mídia',
        path: '/media',
        children: null
      },
      2: {
        id: 42,
        icon: 'fa-photo-film',
        title: 'Álbuns',
        path: '/albums',
        children: null
      }
    }
  },
  5: {
    id: 5,
    icon: 'fa-map',
    title: 'Mapa',
    path: '/map',
    children: null
  },
  6: {
    id: 6,
    icon: 'fa-magnifying-glass',
    title: 'Busca',
    path: '/search',
    children: null
  },
  7: {
    id: 7,
    icon: 'fa-circle-info',
    title: 'Contato',
    path: '/contact',
    children: null
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getAll = async (): Promise<MenuItem[]> => {
  await sleep(10)

  return Object.values(items)
}
