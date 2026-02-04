'use client'

import React from 'react'
import Button from '@/components/ui/button'

export default function DashboardHeader() {
    return (
        <div
            className="relative h-32 overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950"
            style={{
                backgroundImage: 'url(/cta.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative flex h-full items-center justify-between px-8">
                <div>
                    <p className="mb-1 text-sm text-zinc-300">
                        Empower Your Imagination
                    </p>
                    <h2 className="text-2xl font-bold text-white">
                        Launch Your{' '}
                        <span className="text-primary-400">Dream Server</span>{' '}
                        Today
                    </h2>
                </div>
                <Button
                    variant="primary"
                    icon="fas fa-rocket"
                    iconPosition="left"
                    size="md"
                    rounded="pill"
                >
                    Let&apos;s Go!
                </Button>
            </div>
        </div>
    )
}
