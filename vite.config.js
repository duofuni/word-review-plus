import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

/** Copy index.html to 404.html after build (for GitHub Pages SPA fallback). */
function copy404Plugin() {
  return {
    name: 'copy-404',
    closeBundle() {
      const outDir = resolve(__dirname, 'docs')
      copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'))
    },
  }
}

export default defineConfig({
  plugins: [vue(), copy404Plugin()],
  base: '/word-review-plus/',
  build: {
    outDir: 'docs',
  },
})