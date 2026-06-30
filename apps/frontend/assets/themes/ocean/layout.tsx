import type { ReactNode } from 'react'

export default function OceanThemeLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div
            data-theme="ocean"
            className="min-h-screen font-[family-name:var(--font-sans)]"
        >
            {children}
        </div>
    )
}
