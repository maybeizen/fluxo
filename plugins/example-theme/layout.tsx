import type { ReactNode } from 'react'

export default function ExampleThemeLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
            <header className="border-b border-slate-800 px-6 py-4">
                <span className="font-semibold text-sky-400">
                    Example Theme
                </span>
            </header>
            <main>{children}</main>
        </div>
    )
}
