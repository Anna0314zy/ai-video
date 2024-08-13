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
import postcsspxtoviewport from 'postcss-px-to-viewport'
import packageJson from './package.json'
import svgr from '@svgr/rollup'
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist/',
  },
  plugins: [react(), basicSsl(), svgr()],
  envDir: 'env',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        // postcsspxtoviewport({
        //   unitToConvert: 'px', // 要转化的单位
        //   viewportWidth: 1440, // UI设计稿的宽度
        //   unitPrecision: 6, // 转换后的精度，即小数点位数
        //   propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
        //   viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
        //   fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
        //   selectorBlackList: ['ignore-'], // 指定不转换为视窗单位的类名，
        //   minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
        //   mediaQuery: false, // 是否在媒体查询的css代码中也进行转换，默认false
        //   replace: true, // 是否转换后直接更换属性值
        //   exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
        //   landscape: false, // 是否处理横屏情况
        // }),
      ],
    },
  },
  server: {
    strictPort: true,
    port: 5155,
    proxy: {
      '/api': {
        target: 'https://ai-tool-test.ledupeiyou.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/test': {
        target: 'https://test-class-api-online.saasp.vdyoo.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/test/, ''),
      },
    },
  },
})
