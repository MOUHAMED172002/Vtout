import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@clerk/clerk-react': path.resolve(__dirname, './src/components/clerk-shim.jsx')
    }
  },
  server: {
    port: 5174,
    host: true
  }
})
