import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { findResource } from '@/services/api/resources'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/feed',
      name: 'feed',
      component: () => import('@/views/FeedView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue')
    },
    {
      path: '/me',
      name: 'me',
      component: () => import('@/views/account/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/me/password',
      name: 'me-password',
      component: () => import('@/views/account/PasswordView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/email-validation/check/:userId/:validationHash',
      name: 'email-validation',
      component: () => import('@/views/auth/EmailValidationView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/public/SearchView.vue')
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('@/views/public/MapView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/public/ContactView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/upload/media',
      name: 'media-upload',
      component: () => import('@/views/account/MediaUploadView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/media',
      name: 'media-list',
      component: () => import('@/views/public/MediaListView.vue')
    },
    {
      path: '/media/:id',
      name: 'media-detail',
      component: () => import('@/views/public/MediaDetailView.vue')
    },
    {
      path: '/albums',
      name: 'album-list',
      component: () => import('@/views/public/AlbumListView.vue')
    },
    {
      path: '/albums/:id',
      name: 'album-detail',
      component: () => import('@/views/public/AlbumDetailView.vue')
    },
    { path: '/companies', redirect: '/resources/companies' },
    { path: '/manufacturers', redirect: '/resources/manufacturers' },
    { path: '/locations', redirect: '/resources/locations' },
    { path: '/routes', redirect: '/resources/routes' },
    { path: '/paths', redirect: '/resources/paths' },
    { path: '/rolling-stock', redirect: '/resources/rolling-stock' },
    { path: '/locomotives', redirect: '/resources/locomotives' },
    {
      path: '/resources/:resource',
      name: 'resource-list',
      component: () => import('@/views/public/ResourceListView.vue')
    },
    {
      path: '/resources/:resource/:id',
      name: 'resource-detail',
      component: () => import('@/views/public/ResourceDetailView.vue'),
      beforeEnter: (to) => {
        const resource = String(to.params.resource ?? '')
        const id = String(to.params.id ?? '')

        if (resource === 'media') {
          return { name: 'media-detail', params: { id } }
        }

        if (resource === 'albums') {
          return { name: 'album-detail', params: { id } }
        }
      }
    },
    {
      path: '/routes/:routeId/sections/:sectionId',
      name: 'route-section-detail',
      component: () => import('@/views/public/RouteSectionDetailView.vue')
    },
    {
      path: '/admin/resources/:resource',
      name: 'admin-resource',
      component: () => import('@/views/admin/AdminResourceView.vue'),
      meta: { requiresStaff: true }
    },
    {
      path: '/admin/operations',
      name: 'admin-operations',
      component: () => import('@/views/admin/OperationsView.vue'),
      meta: { requiresStaff: true }
    },
    { path: '/admin/users', redirect: '/admin/resources/users' },
    { path: '/admin/mail', redirect: '/admin/resources/mail' },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

type GuardAuth = ReturnType<typeof useAuthStore>

export async function resolveRouteAccess(to: RouteLocationNormalized, auth: GuardAuth) {
  const adminResource =
    to.name === 'admin-resource' ? findResource(String(to.params.resource)) : undefined

  if (auth.token && !auth.user) {
    try {
      await auth.refreshMe()
    } catch {
      auth.logout()
    }
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if ((to.meta.requiresAdmin || adminResource?.access === 'admin') && !auth.isAdmin) {
    return { name: auth.isLoggedIn ? 'home' : 'login', query: { redirect: to.fullPath } }
  }

  if ((to.meta.requiresStaff || adminResource?.access === 'staff') && !auth.isStaff) {
    return { name: auth.isLoggedIn ? 'home' : 'login', query: { redirect: to.fullPath } }
  }
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  return resolveRouteAccess(to, auth)
})

export default router
