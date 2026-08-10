import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Port 8081 is deliberate: it is the origin authorised for the Google
    // OAuth client, so Google Sign-In renders here exactly as it does in the
    // current app. Run only one of frontend/ or frontend-next/ at a time.
    port: 8081,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    },
    proxy: {
      // Proxying keeps API calls same-origin, so the backend's hardcoded
      // CORS origin never comes into play and no backend change is needed.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
