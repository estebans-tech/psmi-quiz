import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
const root = __dirname

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/tests/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage'
    }
  },
  resolve: {
    alias: [
      { find: /^~\//, replacement: `${root}/` },
      { find: /^@\//, replacement: `${root}/` }
    ]
  }
})