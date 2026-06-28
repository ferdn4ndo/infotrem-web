import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export function createViteConfig(mode: string): UserConfig {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_INFOTREM_API_BASE_URL?.trim()

  if (!apiTarget) {
    throw new Error('Missing required env VITE_INFOTREM_API_BASE_URL')
  }
  const apiProxy = {
    target: apiTarget,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, '')
  }

  return {
    plugins: [vue(), vueJsx()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/api': apiProxy
      }
    },
    preview: {
      proxy: {
        '/api': apiProxy
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/variables.scss" as *;'
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => createViteConfig(mode))
