import type { MenuList } from './menu-list.type'

type MenuItem = {
  id: number
  icon: string
  title: string
  path: string | null
  requiresAuth?: boolean
  requiresStaff?: boolean
  requiresAdmin?: boolean
  children: MenuList | null
}

export type { MenuItem }
