import type { MenuItem } from '~/types/menu-item.type'
import type { MenuList } from '~/types/meny-list.type'

const items: MenuList = {
  1: {
    id: 1,
    icon: 'mdi:mdi-apps',
    title: 'Feed',
    path: '/',
    children: null
  },
  2: {
    id: 2,
    icon: 'mdi:mdi-chart-bubble',
    title: 'Material Rodante',
    path: null,
    children: {
      1: {
        id: 3,
        icon: 'fa-solid fa-circle-inf',
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
