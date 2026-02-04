'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarItemProps {
    href?: string
    onClick?: () => void
    icon?: string
    children: React.ReactNode
    active?: boolean
    className?: string
}

export default function NavbarItem({
    href,
    onClick,
    icon,
    children,
    active,
    className = '',
}: NavbarItemProps) {
    const pathname = usePathname()

    const checkIsActive = () => {
        if (active !== undefined) return active
        if (!href) return false

        if (href === '/client' || href === '/admin') {
            return pathname === href
        }

        return pathname.startsWith(href)
    }

    const isActive = checkIsActive()

    const baseClasses = `
    flex items-center gap-2 px-3 py-2 rounded-lg
    text-sm font-medium transition-all duration-200
    ${isActive ? 'bg-primary-400/10 text-primary-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}
    xl:px-4
  `

    const content = (
        <>
            {icon && <i className={icon}></i>}
            <span className="hidden lg:inline">{children}</span>
        </>
    )

    const iconOnlyClasses = `
    md:px-2 md:py-2 md:justify-center
    lg:justify-start lg:px-3
  `

    const tooltipText = typeof children === 'string' ? children : ''

    if (href) {
        return (
            <Link
                href={href}
                className={`${baseClasses} ${iconOnlyClasses} ${className}`}
                title={tooltipText}
            >
                {content}
            </Link>
        )
    }

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${iconOnlyClasses} ${className}`}
            title={tooltipText}
        >
            {content}
        </button>
    )
}
