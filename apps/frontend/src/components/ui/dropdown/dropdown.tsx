'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface DropdownProps {
    trigger: React.ReactNode
    children: React.ReactNode
    className?: string
    align?: 'left' | 'right'
    placement?: 'top' | 'bottom'
    useFixed?: boolean
}

export default function Dropdown({
    trigger,
    children,
    className = '',
    align = 'right',
    placement = 'bottom',
    useFixed = false,
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    useEffect(() => {
        if (isOpen && useFixed && triggerRef.current) {
            const updatePosition = () => {
                if (!triggerRef.current) return
                const rect = triggerRef.current.getBoundingClientRect()
                const dropdownWidth = 224
                const spacing = 8

                let dropdownHeight = 300
                if (dropdownRef.current) {
                    dropdownHeight = dropdownRef.current.offsetHeight
                }

                const maxHeight = window.innerHeight - spacing * 2
                dropdownHeight = Math.min(dropdownHeight, maxHeight)

                let top = 0
                let left = 0

                const spaceAbove = rect.top
                const spaceBelow = window.innerHeight - rect.bottom

                if (placement === 'top') {
                    if (
                        spaceAbove < dropdownHeight + spacing &&
                        spaceBelow > spaceAbove
                    ) {
                        top = rect.bottom + spacing
                    } else {
                        top = Math.max(
                            spacing,
                            rect.top - dropdownHeight - spacing
                        )
                    }
                } else {
                    if (
                        spaceBelow < dropdownHeight + spacing &&
                        spaceAbove > spaceBelow
                    ) {
                        top = Math.max(
                            spacing,
                            rect.top - dropdownHeight - spacing
                        )
                    } else {
                        top = rect.bottom + spacing
                    }
                }

                if (top + dropdownHeight > window.innerHeight - spacing) {
                    top = window.innerHeight - dropdownHeight - spacing
                }

                if (align === 'left') {
                    left = rect.left
                } else {
                    left = rect.right - dropdownWidth
                }

                if (left < spacing) {
                    left = spacing
                } else if (left + dropdownWidth > window.innerWidth - spacing) {
                    left = window.innerWidth - dropdownWidth - spacing
                }

                setPosition({ top, left })
            }

            updatePosition()

            const timeoutId = setTimeout(() => {
                updatePosition()
            }, 10)

            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)

            return () => {
                clearTimeout(timeoutId)
                window.removeEventListener('scroll', updatePosition, true)
                window.removeEventListener('resize', updatePosition)
            }
        }
    }, [isOpen, useFixed, align, placement])

    useEffect(() => {
        if (isOpen && useFixed && dropdownRef.current) {
            const updatePosition = () => {
                if (!triggerRef.current || !dropdownRef.current) return
                const rect = triggerRef.current.getBoundingClientRect()
                const dropdownWidth = 224
                const spacing = 8

                const dropdownHeight = dropdownRef.current.offsetHeight
                const maxHeight = window.innerHeight - spacing * 2
                const actualHeight = Math.min(dropdownHeight, maxHeight)

                let top = 0
                let left = 0

                const spaceAbove = rect.top
                const spaceBelow = window.innerHeight - rect.bottom

                if (placement === 'top') {
                    if (
                        spaceAbove < actualHeight + spacing &&
                        spaceBelow > spaceAbove
                    ) {
                        top = rect.bottom + spacing
                    } else {
                        top = Math.max(
                            spacing,
                            rect.top - actualHeight - spacing
                        )
                    }
                } else {
                    if (
                        spaceBelow < actualHeight + spacing &&
                        spaceAbove > spaceBelow
                    ) {
                        top = Math.max(
                            spacing,
                            rect.top - actualHeight - spacing
                        )
                    } else {
                        top = rect.bottom + spacing
                    }
                }

                if (top + actualHeight > window.innerHeight - spacing) {
                    top = window.innerHeight - actualHeight - spacing
                }

                if (align === 'left') {
                    left = rect.left
                } else {
                    left = rect.right - dropdownWidth
                }

                if (left < spacing) {
                    left = spacing
                } else if (left + dropdownWidth > window.innerWidth - spacing) {
                    left = window.innerWidth - dropdownWidth - spacing
                }

                setPosition({ top, left })
            }

            const resizeObserver = new ResizeObserver(() => {
                updatePosition()
            })

            resizeObserver.observe(dropdownRef.current)

            updatePosition()

            return () => {
                resizeObserver.disconnect()
            }
        }
    }, [isOpen, useFixed, align, placement])

    const alignClass = align === 'right' ? 'right-0' : 'left-0'
    const placementClass =
        placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'

    const dropdownContent = isOpen ? (
        <div
            ref={dropdownRef}
            className={` ${useFixed ? 'fixed' : 'absolute'} ${!useFixed ? `${alignClass} ${placementClass}` : ''} animate-in fade-in slide-in-from-top-2 z-[1000] w-56 overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 shadow-lg duration-200 ${useFixed ? 'max-h-[calc(100vh-16px)] overflow-y-auto' : ''} `}
            style={
                useFixed
                    ? {
                          top: `${position.top}px`,
                          left: `${position.left}px`,
                          animation:
                              'fadeIn 0.2s ease-out, slideDown 0.2s ease-out',
                      }
                    : {
                          animation:
                              'fadeIn 0.2s ease-out, slideDown 0.2s ease-out',
                      }
            }
        >
            {children}
        </div>
    ) : null

    return (
        <div className={`relative ${className}`}>
            <div
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer"
            >
                {trigger}
            </div>

            {useFixed && typeof document !== 'undefined'
                ? createPortal(dropdownContent, document.body)
                : dropdownContent}
        </div>
    )
}
