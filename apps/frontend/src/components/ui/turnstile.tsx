'use client'

import React, {
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
} from 'react'

declare global {
    interface Window {
        turnstile?: {
            render: (
                element: HTMLElement | string,
                options: {
                    sitekey: string
                    callback: (token: string) => void
                    'error-callback'?: () => void
                    'expired-callback'?: () => void
                    theme?: 'light' | 'dark' | 'auto'
                    size?: 'normal' | 'compact'
                }
            ) => string
            reset: (widgetId: string) => void
            remove: (widgetId: string) => void
        }
    }
}

interface TurnstileProps {
    siteKey: string
    onSuccess: (token: string) => void
    onError?: () => void
    onExpire?: () => void
    theme?: 'light' | 'dark' | 'auto'
    size?: 'normal' | 'compact'
    className?: string
}

export interface TurnstileRef {
    reset: () => void
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
    (
        {
            siteKey,
            onSuccess,
            onError,
            onExpire,
            theme = 'auto',
            size = 'normal',
            className = '',
        },
        ref
    ) => {
        const containerRef = useRef<HTMLDivElement>(null)
        const widgetIdRef = useRef<string | null>(null)
        const [isLoaded, setIsLoaded] = useState(false)
        const [hasError, setHasError] = useState(false)
        const callbacksRef = useRef({ onSuccess, onError, onExpire })

        useEffect(() => {
            callbacksRef.current = { onSuccess, onError, onExpire }
        }, [onSuccess, onError, onExpire])

        useEffect(() => {
            setTimeout(() => {
                setHasError(false)
            }, 0)
        }, [siteKey])

        useEffect(() => {
            const script = document.createElement('script')
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
            script.async = true
            script.defer = true

            script.onload = () => {
                setIsLoaded(true)
            }

            document.body.appendChild(script)

            return () => {
                if (widgetIdRef.current && window.turnstile) {
                    try {
                        window.turnstile.remove(widgetIdRef.current)
                    } catch {}
                }
                if (document.body.contains(script)) {
                    document.body.removeChild(script)
                }
            }
        }, [])

        useEffect(() => {
            if (
                !isLoaded ||
                !containerRef.current ||
                !window.turnstile ||
                !siteKey ||
                hasError
            ) {
                return
            }

            if (widgetIdRef.current) {
                try {
                    window.turnstile.remove(widgetIdRef.current)
                } catch {}
                widgetIdRef.current = null
            }

            try {
                const widgetId = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => {
                        callbacksRef.current.onSuccess(token)
                    },
                    'error-callback': () => {
                        setTimeout(() => {
                            setHasError(true)
                        }, 0)
                        if (callbacksRef.current.onError) {
                            callbacksRef.current.onError()
                        }
                    },
                    'expired-callback': () => {
                        if (callbacksRef.current.onExpire) {
                            callbacksRef.current.onExpire()
                        }
                    },
                    theme,
                    size,
                })
                widgetIdRef.current = widgetId
            } catch (error) {
                console.error('Error rendering Turnstile widget:', error)
                setTimeout(() => {
                    setHasError(true)
                }, 0)
                if (callbacksRef.current.onError) {
                    callbacksRef.current.onError()
                }
            }
        }, [isLoaded, siteKey, theme, size, hasError])

        const reset = () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.reset(widgetIdRef.current)
            }
        }

        useImperativeHandle(ref, () => ({
            reset,
        }))

        if (!siteKey) {
            return null
        }

        return <div ref={containerRef} className={className} />
    }
)

Turnstile.displayName = 'Turnstile'

export default Turnstile
