import { defineConfig } from 'tsup'
import { env } from './src/utils/env'
const isDevelopment = env.NODE_ENV === 'development'

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

    onSuccess: isDevelopment ? 'node dist/index.js' : undefined,
})
