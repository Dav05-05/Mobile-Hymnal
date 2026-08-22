import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        maximumFileSizeToCacheInBytes: 50000000, // 50MB limit to allow all 200 scans to cache
      },
      manifest: {
        name: 'Hiligaynon Hymnal',
        short_name: 'Mga Ambahanon',
        theme_color: '#1e40af',
        background_color: '#f8fafc',
        display: 'standalone'
      }
    })
  ]
})