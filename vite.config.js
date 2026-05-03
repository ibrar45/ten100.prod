import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Same host as `RAILWAY_API_ORIGIN` in `src/shared/apiConfig.js` — dev proxy target only. */
const RAILWAY = 'https://ten100compkdeploy-production.up.railway.app'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: RAILWAY,
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: RAILWAY,
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: RAILWAY,
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
})