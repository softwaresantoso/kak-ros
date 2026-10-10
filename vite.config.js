import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Kak ROS - Restaurant Operational System',
        short_name: 'Kak ROS',
        description: 'Sistem operasional restoran by SantoSoft',
        theme_color: '#D95A2A',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/order',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Menu images & static assets cached; Firestore data intentionally
        // NOT cached here — realtime correctness matters more than offline reads
        // for orders/kitchen. See src/hooks/useConnectionStatus.js for the
        // "offline" banner instead of silently serving stale operational data.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp}']
      }
    })
  ],
  server: { port: 5173 }
});
