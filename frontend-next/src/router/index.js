import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true, title: 'Home' },
  },
  {
    path: '/assignments/:id',
    name: 'assignment',
    component: () => import('@/views/AssignmentDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
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
  // The role-specific dashboards are gone — assignments are reached from the
  // sidebar now. Keep the old paths working for anything already bookmarked.
  { path: '/student', redirect: '/' },
  { path: '/student/dashboard', redirect: '/' },
  { path: '/teacher', redirect: '/' },
  { path: '/teacher/dashboard', redirect: '/' },
  { path: '/admin/dashboard', redirect: '/admin' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard — same rule as before: an authenticated user is one that
// has an email in the store, otherwise bounce to /login.
//
// router and the auth store import each other, which ESM resolves cleanly
// because each only *uses* the other at runtime (inside this guard / inside
// actions), never during module evaluation.
router.beforeEach((to) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (!requiresAuth) return true

  return useAuthStore().isAuthenticated ? true : '/login'
})

export default router
