import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { notify } from '@/lib/notify'

// Defaults to the Vite dev-server proxy (`/api` -> http://localhost:8080),
// which keeps requests same-origin so the backend's CORS config is untouched.
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
})

http.interceptors.request.use(
  (config) => {
    // The store is read per-request so a fresh token is always attached.
    const token = useAuthStore().accessToken
    if (token) config.headers['x-access-token'] = token
    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // 401/403 both mean the session is no longer usable (the API returns 403
    // for a missing or invalid token), so send the user back to sign in —
    // but only if they still believe they are signed in.
    //
    // On sign-out the token is cleared while requests may still be in flight.
    // Those come back 403, and redirecting on them would override the
    // navigation sign-out just started, landing the user on /login instead of
    // the page they were sent to.
    if (status === 401 || status === 403) {
      if (
        useAuthStore().isAuthenticated &&
        router.currentRoute.value.path !== '/login'
      ) {
        router.push('/login')
      }
    } else {
      notify('Request failed. Please try again.')
      // Deliberately no redirect here. The Vue 2 app pushed '/' on every
      // non-401 error, which sends the user to the role landing, which
      // re-fetches, which fails again — an infinite redirect/error loop.
    }
    return Promise.reject(error)
  },
)

export default http
