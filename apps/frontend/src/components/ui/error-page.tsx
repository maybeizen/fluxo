'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'

export interface ErrorPageAction {
    label: string
    icon?: string
    iconPosition?: 'left' | 'right'
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'ghost'
}

export interface ErrorPageLink {
    label: string
    icon?: string
    href?: string
    onClick?: () => void
}

export interface ErrorPageProps {
    statusCode: number | string
    title: string
    description: string
    icon?: string
    iconVariant?: 'error' | 'warning' | 'info'
    errorMessage?: string
    actions?: ErrorPageAction[]
    helpLinks?: ErrorPageLink[]
    children?: React.ReactNode
}

const iconVariants = {
    error: 'border-red-800/50 bg-red-900/30',
    warning: 'border-yellow-900/50 bg-yellow-950/30',
    info: 'border-zinc-800 bg-zinc-900',
}

const iconColors = {
    error: 'text-red-500',
    warning: 'text-yellow-600',
    info: 'text-zinc-600',
}

export default function ErrorPage({
    statusCode,
    title,
    description,
    icon,
    iconVariant = 'info',
    errorMessage,
    actions = [],
    helpLinks = [],
    children,
}: ErrorPageProps) {
    const router = useRouter()

    const defaultActions: ErrorPageAction[] = actions.length
        ? actions
        : [
              {
                  label: 'Go to Dashboard',
                  icon: 'fas fa-home',
                  iconPosition: 'left',
                  onClick: () => router.push('/client'),
                  variant: 'primary',
              },
              {
                  label: 'Go Back',
                  icon: 'fas fa-arrow-left',
                  onClick: () => router.back(),
                  variant: 'secondary',
              },
          ]

    const defaultIcon =
        icon ||
        (statusCode === 500
            ? 'fas fa-exclamation-triangle'
            : statusCode === 403
              ? 'fas fa-lock'
              : 'fas fa-question-circle')

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="w-full max-w-2xl text-center">
                <div className="mb-8">
                    <div
                        className={`mb-6 inline-flex h-32 w-32 items-center justify-center rounded-full border-2 ${iconVariants[iconVariant]}`}
                    >
                        <i
                            className={`${defaultIcon} ${iconColors[iconVariant]} text-6xl`}
                        ></i>
                    </div>
                    <h1 className="mb-4 text-7xl font-bold text-white">
                        {statusCode}
                    </h1>
                    <h2 className="mb-4 text-3xl font-semibold text-white">
                        {title}
                    </h2>
                    <p className="mx-auto mb-8 max-w-md text-lg text-zinc-400">
                        {description}
                    </p>
                    {errorMessage && (
                        <div className="mx-auto mb-8 max-w-lg rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                            <p className="text-left font-mono text-sm break-all text-zinc-500">
                                {errorMessage}
                            </p>
                        </div>
                    )}
                    {children}
                </div>

                {defaultActions.length > 0 && (
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        {defaultActions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || 'primary'}
                                icon={action.icon}
                                iconPosition={action.iconPosition}
                                onClick={action.onClick}
                            >
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}

                {helpLinks.length > 0 && (
                    <div className="mt-12 border-t border-zinc-900 pt-8">
                        <p className="mb-4 text-sm text-zinc-500">
                            Need assistance?
                        </p>
                        <div className="flex justify-center gap-4">
                            {helpLinks.map((link, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    size="sm"
                                    icon={link.icon}
                                    iconPosition="left"
                                    onClick={
                                        link.onClick ||
                                        (link.href
                                            ? () => router.push(link.href!)
                                            : undefined)
                                    }
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
