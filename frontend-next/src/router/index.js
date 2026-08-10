import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
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
    meta: { requiresAuth: true },
  },
  {
    path: '/student',
    alias: '/student/dashboard',
    name: 'student-dashboard',
    component: () => import('@/views/Student.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/teacher',
    alias: '/teacher/dashboard',
    name: 'teacher-dashboard',
    component: () => import('@/views/Teacher.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    alias: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true },
  },
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
