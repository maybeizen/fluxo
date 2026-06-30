'use client'

import React from 'react'

const LOCATION_MAP: Record<string, string> = {
    'new-york': 'New York',
    miami: 'Florida',
    germany: 'Germany',
    singapore: 'Singapore',
}

interface CheckoutServerDetailsProps {
    serverType: string
    serviceName: string
    location: string
}

export default function CheckoutServerDetails({
    serverType,
    serviceName,
    location,
}: CheckoutServerDetailsProps) {
    return (
        <div className="mb-6 rounded-lg border border-zinc-900 bg-zinc-950 p-6 lg:p-8">
            <h2 className="mb-4 border-b border-zinc-800 pb-4 text-xl font-semibold text-white">
                Server Details
            </h2>
            <div className="space-y-3">
                <div>
                    <span className="text-zinc-400">Server Type: </span>
                    <span className="font-semibold text-white">
                        {serverType}
                    </span>
                </div>
                <div>
                    <span className="text-zinc-400">Server Name: </span>
                    <span className="font-semibold text-white">
                        {serviceName}
                    </span>
                </div>
                <div>
                    <span className="text-zinc-400">Location: </span>
                    <span className="font-semibold text-white">
                        {LOCATION_MAP[location] || location}
                    </span>
                </div>
            </div>
        </div>
    )
}
