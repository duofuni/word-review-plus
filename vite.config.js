import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'

/** Scan public/words/*.json (except _manifest.json) and write words/_manifest.json for runtime discovery. */
function wordsManifestPlugin() {
  const wordsDir = resolve(__dirname, 'public/words')
  function writeManifest() {
    mkdirSync(wordsDir, { recursive: true })
    const files = readdirSync(wordsDir)
      .filter((f) => f.endsWith('.json') && f !== '_manifest.json')
      .sort()
    writeFileSync(
      resolve(wordsDir, '_manifest.json'),
      `${JSON.stringify({ files }, null, 2)}\n`,
      'utf8',
    )
  }
  return {
    name: 'words-manifest',
    buildStart() {
      writeManifest()
    },
    configureServer() {
      writeManifest()
    },
  }
}

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
  plugins: [vue(), wordsManifestPlugin(), copy404Plugin()],
  base: '/word-review-plus/',
  build: {
    outDir: 'docs',
  },
})