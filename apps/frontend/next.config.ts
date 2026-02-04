import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
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
