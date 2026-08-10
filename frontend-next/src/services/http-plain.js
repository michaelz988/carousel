import axios from 'axios'

// Unauthenticated client, used for the sign-in exchange before a token exists.
export default axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
})
