import type { MenuItem } from '~/types/menu-item.type'
import type { MenuList } from '~/types/menu-list.type'
import { adminResources, domainResources } from '@/services/api/resources'

const items: MenuList = [
  { id: 1, icon: 'fa-home', title: 'Home', path: '/', children: null },
  { id: 2, icon: 'fa-rss', title: 'Feed', path: '/feed', children: null },
  { id: 3, icon: 'fa-photo-film', title: 'Mídia', path: '/media', children: null },
  { id: 4, icon: 'fa-photo-film', title: 'Álbuns', path: '/albums', children: null },
  { id: 5, icon: 'fa-map', title: 'Mapa', path: '/map', children: null },
  { id: 6, icon: 'fa-magnifying-glass', title: 'Busca', path: '/search', children: null },
  {
    id: 7,
    icon: 'fa-building',
    title: 'Empresas',
    path: '/companies',
    children: null
  },
  {
    id: 8,
    icon: 'fa-industry',
    title: 'Fabricantes',
    path: '/manufacturers',
    children: null
  },
  { id: 9, icon: 'fa-location-dot', title: 'Locais', path: '/locations', children: null },
  { id: 10, icon: 'fa-route', title: 'Rotas', path: '/routes', children: null },
  {
    id: 11,
    icon: 'fa-train',
    title: 'Material Rodante',
    path: '/rolling-stock',
    children: [
      {
        id: 111,
        icon: 'fa-gears',
        title: 'Locomotivas',
        path: '/locomotives',
        children: null
      }
    ]
  },
  {
    id: 12,
    icon: 'fa-upload',
    title: 'Enviar mídia',
    path: '/upload/media',
    children: null,
    requiresAuth: true,
    requiresStaff: false
  },
  {
    id: 13,
    icon: 'fa-user',
    title: 'Minha conta',
    path: '/me',
    children: null,
    requiresAuth: true
  },
  {
    id: 14,
    icon: 'fa-key',
    title: 'Alterar senha',
    path: '/me/password',
    children: null,
    requiresAuth: true
  },
  {
    id: 15,
    icon: 'fa-shield-halved',
    title: 'Administração',
    path: '/admin/operations',
    requiresAuth: true,
    requiresStaff: true,
    children: [
      {
        id: 151,
        icon: 'fa-gears',
        title: 'Operações',
        path: '/admin/operations',
        requiresAuth: true,
        requiresStaff: true,
        children: null
      },
      {
        id: 152,
        icon: 'fa-user-secret',
        title: 'Recursos admin',
        path: '/admin/resources/users',
        requiresAuth: true,
        requiresStaff: true,
        children: null
      },
      {
        id: 153,
        icon: 'fa-user-secret',
        title: 'Moderar avaliações',
        path: '/admin/review-moderation',
        requiresAuth: true,
        requiresStaff: true,
        children: null
      }
    ]
  }
]

function toMenuTitle(label: string) {
  return label
}

function buildCatalogChildren(
  resources: { key: string; label: string; access: 'public' | 'auth' | 'staff' | 'admin' }[],
  baseId: number,
  basePath: string
) {
  return resources.map((resource, index) => ({
    id: baseId + index,
    icon: 'fa-folder-open',
    title: toMenuTitle(resource.label),
    path: `${basePath}/${resource.key}`,
    requiresAuth: resource.access !== 'public',
    requiresStaff: resource.access === 'staff' || resource.access === 'admin',
    requiresAdmin: resource.access === 'admin',
    children: null
  }))
}

function canAccess(
  item: MenuItem,
  isLoggedIn: boolean,
  isStaff: boolean,
  isAdmin: boolean
): boolean {
  if (item.requiresAuth && !isLoggedIn) {
    return false
  }

  if (item.requiresAdmin && !isAdmin) {
    return false
  }

  if (item.requiresStaff && !isStaff) {
    return false
  }

  return true
}

export function getAll(isLoggedIn: boolean, isStaff: boolean, isAdmin: boolean): MenuItem[] {
  const catalogItems: MenuItem[] = isStaff
    ? [
        {
          id: 16,
          icon: 'fa-book-open',
          title: 'Catálogo',
          path: null,
          requiresAuth: true,
          requiresStaff: true,
          children: buildCatalogChildren(domainResources, 1600, '/resources')
        },
        {
          id: 17,
          icon: 'fa-screwdriver-wrench',
          title: 'Gerenciar',
          path: null,
          requiresAuth: true,
          requiresStaff: true,
          children: buildCatalogChildren(adminResources, 1700, '/admin/resources')
        }
      ]
    : []

  return [...items, ...catalogItems]
    .filter((item) => canAccess(item, isLoggedIn, isStaff, isAdmin))
    .map((item) => ({
      ...item,
      children:
        item.children?.filter((child) => canAccess(child, isLoggedIn, isStaff, isAdmin)) ?? null
    }))
}
