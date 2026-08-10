import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import AuthService from '@/services/AuthService'
import router from '@/router'

/**
 * Replaces the Vuex store. The shape of `activeUser` / `activeAssignment` is
 * unchanged so every component reads the same fields as before.
 *
 * Note: the Vue 2 store also carried Firebase email/password login, signup and
 * a Firestore profile. Those were vestigial — the app authenticates through
 * Google Identity Services against the backend (`glogin`), and Firebase auth
 * never actually signed in, so those paths could not run. They are omitted
 * here rather than carried forward as dead code.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    activeUser: {},
    activeAssignment: {},
    activeSchool: {},
  }),

  getters: {
    isAuthenticated: (s) => Boolean(s.activeUser.email),
    role: (s) => (s.activeUser.roles && s.activeUser.roles[0]) || '',
    accessToken: (s) => s.activeUser.accessToken,
    homeRoute() {
      switch (this.role) {
        case 'ROLE_STUDENT':
          return '/student'
        case 'ROLE_TEACHER':
          return '/teacher'
        case 'ROLE_ADMIN':
          return '/admin'
        default:
          return '/'
      }
    },
  },

  actions: {
    /**
     * Google Identity Services sign-in. Logic is a faithful port of the Vuex
     * `glogin` action: decode the credential, exchange it with the backend,
     * store the returned user, then route by role.
     */
    async glogin(gUser) {
      try {
        const token = gUser.credential
        const decoded = jwtDecode(token)
        const gmail = decoded.email

        const response = await AuthService.signin({
          email: gmail,
          credential: token,
        })
        this.activeUser = response.data

        switch (this.activeUser.roles[0]) {
          case 'ROLE_STUDENT':
            router.push('/student')
            break
          case 'ROLE_TEACHER':
            router.push('/teacher')
            break
          case 'ROLE_ADMIN':
            router.push('/admin')
            break
          default:
            router.push('/')
            break
        }
      } catch (err) {
        console.log(err)
      }
    },

    logout() {
      this.activeUser = {}
      this.activeAssignment = {}
      this.activeSchool = {}
      router.push('/login')
    },

    updateActiveAssignment(assignment) {
      this.activeAssignment = assignment
    },
  },
})
