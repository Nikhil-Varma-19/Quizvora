import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      'http://localhost:7000/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
      },
      // '/socket.io': {
      //   target: 'http://localhost:7000',
      //   changeOrigin: true,
      //   ws: true,
      // },
    },
  },
})
