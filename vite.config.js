import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // aceita conexões externas (como do ngrok)
    port: 5173,        // porta fixa do Vite
    strictPort: true,  // se a porta 5173 estiver ocupada, falha
    cors: true,        // libera CORS
  },
})
