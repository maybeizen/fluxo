import type { ReactNode } from 'react'

export default function DefaultThemeLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div data-theme="default" className="min-h-screen">
            {children}
        </div>
    )
}
