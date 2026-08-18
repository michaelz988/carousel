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
  // The session survives a reload; see stores/persist.js
  persist: true,

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
      return this.role === 'ROLE_ADMIN' ? '/admin' : '/home'
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

        // The backend does not store avatars, but the Google credential
        // carries `picture` (and `name`). Keep them client-side so the top bar
        // can show the account's real photo instead of initials.
        this.activeUser = {
          ...response.data,
          picture: decoded.picture || null,
          fullName: decoded.name || null,
        }

        // Everyone lands on the same home; the sidebar adapts to the role.
        router.push(this.role === 'ROLE_ADMIN' ? '/admin' : '/home')
      } catch (err) {
        console.log(err)
      }
    },

    logout() {
      this.activeUser = {}
      this.activeAssignment = {}
      this.activeSchool = {}
      router.push('/')
    },

    updateActiveAssignment(assignment) {
      this.activeAssignment = assignment
    },
  },
})
