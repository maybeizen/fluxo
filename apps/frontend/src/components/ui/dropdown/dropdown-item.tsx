import React from 'react'
import Link from 'next/link'

interface DropdownItemProps {
    href?: string
    onClick?: () => void
    icon?: string
    children: React.ReactNode
    danger?: boolean
    className?: string
}

export default function DropdownItem({
    href,
    onClick,
    icon,
    children,
    danger = false,
    className = '',
}: DropdownItemProps) {
    const baseClasses = `
    flex items-center gap-3 px-4 py-2 text-sm transition-colors
    ${
        danger
            ? 'text-red-400 hover:bg-zinc-900 hover:text-red-300'
            : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
    }
  `

    const content = (
        <>
            {icon && <i className={`${icon} w-4`}></i>}
            <span>{children}</span>
        </>
    )

    if (href) {
        return (
            <Link href={href} className={`${baseClasses} ${className}`}>
                {content}
            </Link>
        )
    }

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${className} w-full text-left`}
        >
            {content}
        </button>
    )
}
