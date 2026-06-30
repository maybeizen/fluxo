import { config } from 'dotenv'
import { resolve } from 'node:path'
import type { NextConfig } from 'next'

const preservedNodeEnv = process.env.NODE_ENV
config({ path: resolve(process.cwd(), '../../.env'), override: true })
if (preservedNodeEnv) {
    ;(process.env as Record<string, string>).NODE_ENV = preservedNodeEnv
}

function getStorageOrigin(): string {
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'
    return apiUrl.replace(/\/api\/v1\/?$/, '')
}

type RemotePattern = NonNullable<
    NonNullable<NextConfig['images']>['remotePatterns']
>[number]

function buildRemotePatterns(): RemotePattern[] {
    const patterns: RemotePattern[] = []

    try {
        const apiUrl = new URL(getStorageOrigin())
        patterns.push({
            protocol: apiUrl.protocol.replace(':', '') as 'http' | 'https',
            hostname: apiUrl.hostname,
            ...(apiUrl.port ? { port: apiUrl.port } : {}),
            pathname: '/storage/**',
        })
        patterns.push({
            protocol: apiUrl.protocol.replace(':', '') as 'http' | 'https',
            hostname: apiUrl.hostname,
            ...(apiUrl.port ? { port: apiUrl.port } : {}),
            pathname: '/uploads/**',
        })
    } catch {
        patterns.push({
            protocol: 'http',
            hostname: 'localhost',
            port: '5001',
            pathname: '/storage/**',
        })
        patterns.push({
            protocol: 'http',
            hostname: 'localhost',
            port: '5001',
            pathname: '/uploads/**',
        })
    }

    const s3PublicBase = process.env.S3_PUBLIC_URL_BASE
    if (s3PublicBase) {
        try {
            const s3Url = new URL(s3PublicBase)
            patterns.push({
                protocol: s3Url.protocol.replace(':', '') as 'http' | 'https',
                hostname: s3Url.hostname,
                ...(s3Url.port ? { port: s3Url.port } : {}),
                pathname: '/**',
            })
        } catch {
            // ignore invalid S3_PUBLIC_URL_BASE
        }
    }

    const s3Bucket = process.env.S3_BUCKET
    const s3Region = process.env.S3_REGION
    if (s3Bucket && s3Region) {
        patterns.push({
            protocol: 'https',
            hostname: `${s3Bucket}.s3.${s3Region}.amazonaws.com`,
            pathname: '/**',
        })
    }

    patterns.push({
        protocol: 'https',
        hostname: '**',
    })

    return patterns
}

const storageOrigin = getStorageOrigin()

const nextConfig: NextConfig = {
    images: {
        dangerouslyAllowLocalIP:
            process.env.NODE_ENV === 'development' ||
            storageOrigin.includes('localhost') ||
            storageOrigin.includes('127.0.0.1'),
        remotePatterns: buildRemotePatterns(),
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
