import { config } from 'dotenv'
import { resolve } from 'node:path'
import type { NextConfig } from 'next'

const preservedNodeEnv = process.env.NODE_ENV
config({ path: resolve(process.cwd(), '../../.env'), override: true })
if (preservedNodeEnv) {
    ;(process.env as Record<string, string>).NODE_ENV = preservedNodeEnv
}

const nextConfig: NextConfig = {
    images: {
        // Allow loading images from localhost (API at :5001) during dev or when
        // using a local API URL (e.g. bun run start with API at localhost).
        dangerouslyAllowLocalIP:
            process.env.NODE_ENV === 'development' ||
            (process.env.NEXT_PUBLIC_API_URL || '').includes('localhost'),
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                pathname: '**/*',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5001',
                pathname: '/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
}

export default nextConfig
