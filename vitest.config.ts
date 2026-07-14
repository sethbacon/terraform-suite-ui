import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/types.ts', 'src/index.ts'],
      // Gate the core areas (identity/shell/theme/utils) so their coverage can't silently
      // regress. Floors sit a few points below the current aggregate for each area; raise
      // them as coverage improves, but never lower without cause.
      thresholds: {
        'src/identity/**': { statements: 85, branches: 72, functions: 80, lines: 88 },
        'src/shell/**': { statements: 82, branches: 74, functions: 70, lines: 82 },
        'src/theme/**': { statements: 87, branches: 73, functions: 85, lines: 90 },
        'src/utils/**': { statements: 88, branches: 90, functions: 95, lines: 85 },
      },
    },
  },
})
