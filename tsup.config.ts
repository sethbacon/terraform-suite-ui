import { defineConfig } from 'tsup'

/**
 * Build the library as ESM with type declarations. All framework packages are
 * marked external (declared as peerDependencies) so the consuming apps provide a
 * single copy of React, MUI, etc. at runtime.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2021',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@mui/material',
    '@mui/icons-material',
    '@emotion/react',
    '@emotion/styled',
    'i18next',
    'react-i18next',
    'react-router-dom',
  ],
})
