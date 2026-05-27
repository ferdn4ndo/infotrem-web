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
        path: '/inspire',
        children: null
      }
    }
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getAll = async (): Promise<MenuItem[]> => {
  await sleep(10)

  return Object.values(items)
}
