import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    proxy: {
      '/api/auth': { target: 'http://localhost:3001', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/auth/, '') },
      '/api/notes': { target: 'http://localhost:3003', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/notes/, '') },
    },
  },
})
