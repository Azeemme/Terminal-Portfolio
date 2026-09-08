/// <reference types="vitest/config" />
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages SPA deep-link fallback (plan §12): write `404.html` as a copy of
 * `index.html` after the build. Pages serves real files (`/Resume.pdf`,
 * `/og-image.png`, hashed assets) directly and only falls back to `404.html` on
 * a genuine miss, so client routes like `/projects/suits` resolve on refresh
 * while static assets are untouched.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const root = process.cwd()
      const index = resolve(root, outDir, 'index.html')
      if (existsSync(index)) {
        copyFileSync(index, resolve(root, outDir, '404.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallback()],
  base: '/',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
