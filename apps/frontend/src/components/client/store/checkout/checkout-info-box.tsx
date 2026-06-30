'use client'

import React from 'react'

export default function CheckoutInfoBox() {
    return (
        <div className="rounded-lg border border-purple-500/50 bg-purple-500/20 p-4">
            <div className="flex items-start gap-3">
                <i className="fas fa-info-circle mt-0.5 text-purple-400"></i>
                <p className="text-sm text-white">
                    You can apply coupon codes after clicking &quot;Create
                    Invoice&quot;.
                </p>
            </div>
        </div>
    )
}
