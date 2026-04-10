import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
  },

  build: {
    chunkSizeWarningLimit: 1000, // aumenta aviso (opcional, só pra não "poluir")
    rollupOptions: {
      output: {
        manualChunks(id) {
          // separa libs pesadas em chunks próprios
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('react-router')) return 'router'
            if (id.includes('html2canvas')) return 'html2canvas'
            if (id.includes('dompurify')) return 'purify'
            return 'vendor'
          }
        }
      }
    }
  }
})