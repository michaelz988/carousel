import { createRouter, createWebHistory } from 'vue-router'
import Landing from '@/views/Landing.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Public marketing page. Signed-in users are sent straight to the app.
  {
    path: '/',
    name: 'landing',
    component: Landing,
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },

  // The application itself.
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true, title: 'Home' },
  },
  {
    path: '/assignments/:id',
    name: 'assignment',
    component: () => import('@/views/AssignmentDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true, title: 'Account' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, title: 'Teachers' },
  },

  // Older paths, kept so existing links and bookmarks still resolve.
  { path: '/student', redirect: '/home' },
  { path: '/student/dashboard', redirect: '/home' },
  { path: '/teacher', redirect: '/home' },
  { path: '/teacher/dashboard', redirect: '/home' },
  { path: '/admin/dashboard', redirect: '/admin' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// router and the auth store import each other, which ESM resolves cleanly
// because each only *uses* the other at runtime (inside this guard / inside
// actions), never during module evaluation.
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Signed-in users have no use for the marketing page or the login form.
  if ((to.name === 'landing' || to.name === 'Login') && auth.isAuthenticated) {
    return auth.homeRoute
  }

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (!requiresAuth) return true

  return auth.isAuthenticated ? true : '/login'
})

export default router
