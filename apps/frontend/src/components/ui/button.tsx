'use client'

import React, { useEffect, useState } from 'react'

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'fail'
    | 'glass'
    | 'ghost'
    | 'custom'

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type ButtonRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'pill'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode
    variant?: ButtonVariant
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
    size?: ButtonSize
    rounded?: ButtonRounded
    icon?: string
    iconPosition?: 'left' | 'right'
}

const variantClass: Record<ButtonVariant, string> = {
    primary:
        'bg-primary-400 hover:bg-primary-500 border border-primary-400 shadow-primary-400/20',
    secondary:
        'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 shadow-neutral-700/20',
    success:
        'bg-green-500 hover:bg-green-600 text-white border border-green-500 shadow-green-500/20',
    fail: 'bg-red-500 hover:bg-red-600 border border-red-500 shadow-red-500/20',
    glass: 'bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/10 shadow-white/10',
    ghost: 'bg-transparent hover:bg-neutral-800/30 text-white border border-transparent',
    custom: '',
}

const sizeClass: Record<ButtonSize, string> = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl',
}

const roundedClass: Record<ButtonRounded, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    pill: 'rounded-full',
}

const Spinner = () => (
    <span
        className="mr-2 flex items-center justify-center"
        style={{ minWidth: 18, minHeight: 18 }}
    >
        <i className="fas fa-spinner-third fa-spin fa-lg text-current" />
    </span>
)

export default function Button({
    variant = 'primary',
    disabled = false,
    loading = false,
    fullWidth = false,
    size = 'md',
    rounded = 'md',
    children,
    icon,
    iconPosition = 'left',
    className = '',
    ...rest
}: ButtonProps) {
    const isDisabled = disabled || loading

    const IconElement = icon ? (
        <span
            className={`flex items-center ${iconPosition === 'left' ? 'mr-2' : 'ml-2'}`}
            aria-hidden="true"
        >
            <i className={icon} />
        </span>
    ) : null

    const cursorClass = isDisabled
        ? 'cursor-not-allowed'
        : 'cursor-pointer hover:cursor-pointer'

    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        const id = setTimeout(() => setIsMounted(true), 0)
        return () => clearTimeout(id)
    }, [])

    const getTextColorClass = () => {
        if (variant === 'primary' && isMounted) {
            return 'text-primary-contrast'
        }
        if (variant === 'primary') {
            return 'text-white'
        }
        if (variant === 'fail') {
            return 'text-white'
        }
        return ''
    }

    return (
        <button
            type={rest.type || 'button'}
            disabled={isDisabled}
            className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${variantClass[variant]} ${getTextColorClass()} ${sizeClass[size]} ${roundedClass[rounded]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${cursorClass} relative font-semibold select-none ${className} `}
            {...rest}
        >
            {loading && <Spinner />}

            {icon && iconPosition === 'left' && !loading && IconElement}

            <span className="flex items-center">{children}</span>

            {icon && iconPosition === 'right' && !loading && IconElement}
        </button>
    )
}
