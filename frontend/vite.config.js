import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:3000',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@clerk/clerk-react': path.resolve(__dirname, './src/lib/clerk-shim.jsx')
    }
  }
})
