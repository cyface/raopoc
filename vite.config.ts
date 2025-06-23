import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

export default defineConfig({
  plugins: [
    react(), 
    vanillaExtractPlugin()
  ],
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow connections from outside container
    strictPort: true, // Fail if port 5173 is not available
    hmr: {
      port: 5173,
      host: 'localhost', // WebSocket connection host
      clientPort: 5173, // Port for client to connect to WebSocket
    },
    watch: {
      usePolling: true, // Use polling for file changes in Docker
    },
  },
  // @ts-ignore - Vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts', './src/test-utils/setup.ts'],
  },
})