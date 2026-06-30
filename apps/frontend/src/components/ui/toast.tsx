'use client'

import React, { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center'

export interface ToastProps {
    id: string
    type: ToastType
    title?: string
    message: string
    duration?: number
    position?: ToastPosition
    disabled?: boolean
    onClose: (id: string) => void
}

const toastStyles = {
    success: {
        bg: 'bg-green-500/10 border-green-500/20',
        icon: 'fas fa-check-circle text-green-400',
        text: 'text-green-400',
        progress: 'bg-green-400',
    },
    error: {
        bg: 'bg-red-500/10 border-red-500/20',
        icon: 'fas fa-exclamation-circle text-red-400',
        text: 'text-red-400',
        progress: 'bg-red-400',
    },
    warning: {
        bg: 'bg-yellow-500/10 border-yellow-500/20',
        icon: 'fas fa-exclamation-triangle text-yellow-400',
        text: 'text-yellow-400',
        progress: 'bg-yellow-400',
    },
    info: {
        bg: 'bg-blue-500/10 border-blue-500/20',
        icon: 'fas fa-info-circle text-blue-400',
        text: 'text-blue-400',
        progress: 'bg-blue-400',
    },
}

export default function Toast({
    id,
    type,
    title,
    message,
    duration = 5000,
    disabled = false,
    onClose,
}: ToastProps) {
    const [progress, setProgress] = useState(100)
    const [isVisible, setIsVisible] = useState(false)
    const [isExiting, setIsExiting] = useState(false)

    const styles = toastStyles[type]

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(() => onClose(id), 300)
    }

    useEffect(() => {
        const showTimer = setTimeout(() => setIsVisible(true), 10)

        if (!disabled && duration > 0) {
            const progressTimer = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = prev - 100 / (duration / 100)
                    if (newProgress <= 0) {
                        clearInterval(progressTimer)
                        handleClose()
                        return 0
                    }
                    return newProgress
                })
            }, 100)

            return () => {
                clearTimeout(showTimer)
                clearInterval(progressTimer)
            }
        }

        return () => clearTimeout(showTimer)
    }, [duration, disabled])

    return (
        <div
            className={`transform transition-all duration-300 ease-in-out ${
                isVisible && !isExiting
                    ? 'translate-x-0 scale-100 opacity-100'
                    : 'translate-x-full scale-95 opacity-0'
            } relative w-full max-w-sm ${styles.bg} mb-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${disabled ? 'opacity-60' : ''} `}
        >
            <button
                onClick={handleClose}
                className="absolute top-2 right-2 cursor-pointer p-1 text-white/40 transition-colors hover:text-white/60"
                disabled={disabled}
            >
                <i className="fas fa-times text-sm" />
            </button>
            <div className="flex items-start gap-3 pr-6">
                <div className="mt-0.5 flex-shrink-0">
                    <i className={`${styles.icon} text-lg`} />
                </div>

                <div className="min-w-0 flex-1">
                    {title && (
                        <h4 className="mb-1 text-sm leading-tight font-semibold text-white">
                            {title}
                        </h4>
                    )}
                    <p className="text-sm leading-relaxed break-words text-white/80">
                        {message}
                    </p>
                </div>
            </div>
            {!disabled && duration > 0 && (
                <div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-lg bg-white/10">
                    <div
                        className={`h-full ${styles.progress} rounded-b-lg transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    )
}
