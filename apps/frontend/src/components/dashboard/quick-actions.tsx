'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'

export default function QuickActions() {
    const router = useRouter()

    return (
        <Card padding="md">
            <h3 className="mb-4 text-lg font-semibold text-white">
                Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Button
                    variant="secondary"
                    icon="fas fa-plus"
                    iconPosition="left"
                    fullWidth
                    onClick={() => router.push('/client/store')}
                >
                    Buy Server
                </Button>
                <Button
                    variant="secondary"
                    icon="fas fa-headset"
                    iconPosition="left"
                    fullWidth
                    onClick={() => router.push('/client/support/new')}
                >
                    New Ticket
                </Button>
                <Button
                    variant="secondary"
                    icon="fas fa-user-circle"
                    iconPosition="left"
                    fullWidth
                    onClick={() => router.push('/client/profile')}
                >
                    Edit Profile
                </Button>
            </div>
        </Card>
    )
}
