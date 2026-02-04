import React from 'react'

interface NavbarProps {
    children: React.ReactNode
    className?: string
}

export default function Navbar({ children, className = '' }: NavbarProps) {
    return (
        <nav
            className={`fixed top-8 right-0 left-0 z-10 border-b border-zinc-900 bg-zinc-950 px-2 py-2 md:top-0 ${className}`}
        >
            <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-2">
                {children}
            </div>
        </nav>
    )
}
