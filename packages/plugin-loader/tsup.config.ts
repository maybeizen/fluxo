import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    target: 'node20',
    format: ['esm'],
    sourcemap: true,
    clean: true,
    dts: true,
    skipNodeModulesBundle: true,
})
