import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
    plugins: [VitePWA({
    registerType: 'autoUpdate',
    manifest: {
        name: 'Roleplay Writer',
        short_name: 'RPWriter',
        description: 'Herramienta de escritura para roleplayers y creadores narrativos',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        start_url: '/',
        icons: [
        {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
        },
        {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
        }
        ]
    },
    workbox: {
        // Cache First: assets estáticos que no cambian
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],

        // Network First: el JSON de símbolos puede actualizarse
        runtimeCaching: [
        {
            urlPattern: /\/symbols\.json$/,
            handler: 'NetworkFirst',
            options: {
            cacheName: 'symbols-cache',
            expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
            }
            }
        },
        {
            // Network First para Supabase: queremos datos frescos,
            // pero si no hay red usamos lo que hay en caché
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
            handler: 'NetworkFirst',
            options: {
            cacheName: 'supabase-cache',
            networkTimeoutSeconds: 5,
            expiration: {
                maxAgeSeconds: 60 * 60 * 24 // 1 día
            }
            }
        },
        {
            // Network First para LanguageTool
            urlPattern: /^https:\/\/api\.languagetoolplus\.com\/.*/,
            handler: 'NetworkOnly', // el corrector requiere red obligatoriamente
            options: {
            cacheName: 'languagetool-cache'
            }
        }
        ]
    }
    }), cloudflare()]
})