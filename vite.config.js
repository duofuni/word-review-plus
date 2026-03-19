import {
  defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/word-review-plus/',
  build: {
    outDir: 'docs'
  },
})