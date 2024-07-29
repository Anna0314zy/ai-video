/*
 * @Date: 2024-04-09 10:41:35
 * @LastEditors: 周东晨 p_zhoudongchen@ledupeiyou.com
 * @LastEditTime: 2024-07-26 17:48:05
 * @FilePath: /ai-content-platform/vite.config.ts
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'
import packageJson from './package.json'
import requireTransform from 'vite-plugin-require-transform'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist/' + packageJson.version,
  },
  plugins: [react(), basicSsl(), requireTransform({
    fileRegex:/.ts$|.tsx$/
  })],
  envDir: 'env',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    strictPort: true,
    port: 5155,
    proxy: {
      '/api': {
        target: 'https://test-class-api-online.saasp.vdyoo.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
