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
  // Ship a minified bundle; the build script then strips sourcesContent from
  // the maps (scripts/strip-sourcemap-sources.mjs), so stack traces still map
  // to names/positions but the tarball no longer embeds the full source text —
  // the public GitHub repo is the reference for actual source-level debugging.
  minify: true,
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
