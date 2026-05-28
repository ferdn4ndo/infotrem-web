import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import FeedView from '../views/FeedView.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/feed',
      name: 'feed',
      component: FeedView
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
      path: '/upload/media',
      name: 'media-upload',
      component: () => import('@/views/account/MediaUploadView.vue'),
      meta: { requiresAuth: true }
    },
    { path: '/media', redirect: '/resources/media' },
    { path: '/media/:id', redirect: (to) => `/resources/media/${to.params.id}` },
    { path: '/albums', redirect: '/resources/albums' },
    { path: '/albums/:id', redirect: (to) => `/resources/albums/${to.params.id}` },
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
      component: () => import('@/views/public/ResourceDetailView.vue')
    },
    {
      path: '/admin/resources/:resource',
      name: 'admin-resource',
      component: () => import('@/views/admin/AdminResourceView.vue'),
      meta: { requiresStaff: true }
    },
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

router.beforeEach(async (to) => {
  const auth = useAuthStore()

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

  if (to.meta.requiresStaff && !auth.isStaff) {
    return { name: auth.isLoggedIn ? 'home' : 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: auth.isLoggedIn ? 'home' : 'login', query: { redirect: to.fullPath } }
  }
})

export default router
