/*
 * @Date: 2024-04-09 10:41:35
 * @LastEditors: 周东晨 p_zhoudongchen@ledupeiyou.com
 * @LastEditTime: 2024-07-26 17:48:05
 * @FilePath: /ai-content-platform/vite.config.ts
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// zy老师要求移除适配
// import postcsspxtoviewport from 'postcss-px-to-viewport'
import packageJson from './package.json'
import svgr from '@svgr/rollup'
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist/',
  },
  plugins: [react(), svgr()],
  envDir: 'env',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    host: '127.0.0.1',
    strictPort: true,
    port: 5155,
  },
})
