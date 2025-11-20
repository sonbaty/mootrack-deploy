import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icon.svg'],
        manifest: {
          name: 'MoodTrack AI',
          short_name: 'MoodTrack',
          description: 'A smart daily journal and mood tracker to help you reflect on your days and analyze emotional trends.',
          theme_color: '#6366f1',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.tailwindcss\.com/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'tailwind-cdn-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                }
              }
            }
          ]
        }
      })
    ],
    base: '/',
    define: {
      // Safely polyfill process.env.API_KEY. 
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
  };
});