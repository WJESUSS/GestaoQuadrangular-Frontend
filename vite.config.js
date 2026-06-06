import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: false,
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion'))            return 'motion'
          if (id.includes('recharts'))                 return 'charts'
          if (id.includes('jspdf'))                    return 'pdf'
          if (id.includes('lucide-react'))             return 'icons'
          if (id.includes('react-router-dom') ||
              id.includes('react-dom') ||
              id.includes('/react/'))                  return 'react-vendor'
        },
      },
    },
  },
})