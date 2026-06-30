import React from 'react'

interface DropdownHeaderProps {
    children: React.ReactNode
    className?: string
}

export default function DropdownHeader({
    children,
    className = '',
}: DropdownHeaderProps) {
    return (
        <div className={`border-b border-zinc-900 px-4 py-3 ${className}`}>
            {children}
        </div>
    )
}
