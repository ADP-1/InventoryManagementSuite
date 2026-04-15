import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor';
            if (id.includes('@tanstack')) return 'query';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('react-hook-form') || id.includes('zod')) return 'forms';
            return 'vendor';
          }
        }
      }
    }
  }
})
