import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { constants } from 'zlib'
import { compression, defineAlgorithm } from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
      vueDevTools({
        launchEditor: env.LAUNCH_EDITOR || 'code',
      }),
      compression({
        algorithms: [
          defineAlgorithm('gzip', { level: 9 }),
          defineAlgorithm('brotliCompress', {
            params: {
              [constants.BROTLI_PARAM_QUALITY]: 11,
            },
          }),
        ],
        threshold: 1024,
        skipIfLargerOrEqual: true,
      }),
    ],
    server: {
      host: '127.0.0.1',
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
