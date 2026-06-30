import React from 'react'

type Position = 'left' | 'center' | 'right'

interface NavbarPosProps {
    position: Position
    children: React.ReactNode
    className?: string
}

const positionClasses: Record<Position, string> = {
    left: 'hidden md:flex items-center gap-1 xl:gap-2',
    center: 'hidden md:flex items-center gap-1 xl:gap-2 mx-auto',
    right: 'flex items-center gap-1 xl:gap-2 ml-auto',
}

export default function NavbarPos({
    position,
    children,
    className = '',
}: NavbarPosProps) {
    return (
        <div className={`${positionClasses[position]} ${className}`}>
            {children}
        </div>
    )
}
