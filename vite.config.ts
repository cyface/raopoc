import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(), 
    vanillaExtractPlugin(),
    // Plugin to copy config files to public directory
    {
      name: 'copy-config',
      buildStart() {
        // Ensure public/config directory exists
        const publicConfigDir = resolve(__dirname, 'public/config')
        if (!existsSync(publicConfigDir)) {
          mkdirSync(publicConfigDir, { recursive: true })
        }
        
        // Copy config files to public directory
        const configFiles = ['states.json', 'identification-types.json', 'products.json']
        configFiles.forEach(file => {
          const src = resolve(__dirname, `config/${file}`)
          const dest = resolve(__dirname, `public/config/${file}`)
          if (existsSync(src)) {
            copyFileSync(src, dest)
          }
        })
      }
    }
  ],
  // @ts-ignore - Vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})