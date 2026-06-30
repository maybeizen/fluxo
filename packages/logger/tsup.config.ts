import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    target: 'node20',
    format: ['esm'],
    splitting: true,
    sourcemap: true,
    clean: true,
    dts: true,
    minify: false,
    skipNodeModulesBundle: true,
    treeshake: true,
})
