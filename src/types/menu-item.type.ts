import type { MenuList } from './meny-list.type'

type MenuItem = {
  id: number
  icon: string
  title: string
  path: string | null
  children: MenuList | null
}

export type { MenuItem }
