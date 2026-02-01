import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Use esbuild for Node 18 compatibility (instead of rolldown which requires Node 20+)
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  ssr: {
    noExternal: [],
  },
})
