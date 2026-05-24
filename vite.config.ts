/// <reference types="vitest/config" />

import { defineConfig } from 'vitest/config'

/** GitHub Pages プロジェクトサイト: https://flowingspdg.github.io/menchika-japanese/ */
export default defineConfig({
  base: '/menchika-japanese/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
