'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useAuth } from '@/context/auth-context'
import { useNotifications } from '@/context/notification-context'
import { postWithErrors } from '@/utils/post-handle'
import LoadingScreen from '@/components/loading-screen'

function VerifyEmailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, isLoading, refreshAuth } = useAuth()
    const notifications = useNotifications()
    const hasVerified = useRef(false)

    const [status, setStatus] = useState<
        'verifying' | 'success' | 'info' | 'error'
    >('verifying')
    const [title, setTitle] = useState('Verifying Your Email')
    const [message, setMessage] = useState(
        'Please wait while we verify your email address...'
    )

    const [email, setEmail] = useState('')
    const [resending, setResending] = useState(false)
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (!isLoading && user?.isVerified) {
            router.replace('/client')
        }
    }, [user, isLoading, router])

    useEffect(() => {
        const token = searchParams.get('token')
        const emailParam = searchParams.get('email')

        if (user?.isVerified) {
            return
        }

        if (token) {
            handleTokenVerification(token)
        } else if (emailParam) {
            setEmail(emailParam)
            setStatus('info')
            setTitle('Verify Your Email')
            setMessage(
                `We sent a verification link to ${emailParam}. Please check your inbox.`
            )
        } else {
            if (!user) {
                setStatus('error')
                setTitle('Invalid Request')
                setMessage('No verification token or email provided.')
            }
        }
    }, [searchParams, user])

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(
                () => setCooldown((prev) => prev - 1),
                1000
            )
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const handleTokenVerification = async (token: string) => {
        if (hasVerified.current) return
        hasVerified.current = true

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`,
                { credentials: 'include' }
            )
            const data = await response.json()
            const from = searchParams.get('from')

            if (response.ok && data.success) {
                setStatus('success')
                setTitle(
                    data.alreadyVerified
                        ? 'Email Already Verified'
                        : 'Email Verified!'
                )
                setMessage(data.message || 'You can now access all features.')

                await refreshAuth()

                setTimeout(() => {
                    router.push(from || '/client')
                }, 2000)
            } else {
                setStatus('error')
                setTitle(data.expired ? 'Link Expired' : 'Verification Failed')
                setMessage(data.message || 'The verification link is invalid.')
                if (data.email) setEmail(data.email)
            }
        } catch (error) {
            setStatus('error')
            setTitle('Verification Failed')
            setMessage('An error occurred. Please try again later.')
        }
    }

    const handleResend = async () => {
        if (!email) {
            notifications.error('Email address not found.')
            return
        }

        setResending(true)

        try {
            interface ResendVerificationResponse {
                success: boolean
                message?: string
            }

            const response = await postWithErrors<ResendVerificationResponse>(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
                { email }
            )

            if (response.data?.success) {
                notifications.success('Verification email sent!')
                setCooldown(60)
            } else {
                const errorMsg = response.error || 'Failed to resend email.'
                notifications.error(errorMsg)
                if (errorMsg.includes('Too many')) {
                    setCooldown(900)
                }
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred.'
            notifications.error(message)
        } finally {
            setResending(false)
        }
    }

    const getIcon = () => {
        switch (status) {
            case 'verifying':
                return <Spinner />
            case 'success':
                return (
                    <i className="fas fa-check-circle text-3xl text-green-500" />
                )
            case 'info':
                return (
                    <i className="fas fa-info-circle text-3xl text-blue-500" />
                )
            case 'error':
                return (
                    <i className="fas fa-times-circle text-primary-400 text-3xl" />
                )
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="w-full max-w-md">
                <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-8 text-center">
                    <div
                        className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
                            status === 'success' ? 'bg-green-500/10' : ''
                        } ${status === 'info' ? 'bg-blue-500/10' : ''} ${
                            status === 'error' ? 'bg-primary-400/10' : ''
                        }`}
                    >
                        {getIcon()}
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-white">
                        {title}
                    </h1>
                    <p className="mb-6 text-sm text-zinc-400">{message}</p>

                    {status === 'verifying' && (
                        <p className="text-primary-400 mb-6 text-xs font-bold">
                            This may take a while, do not close or refresh this
                            page.
                        </p>
                    )}

                    {status === 'success' && (
                        <p className="text-sm text-green-400">
                            Redirecting you to the dashboard...
                        </p>
                    )}

                    {(status === 'error' || status === 'info') && email && (
                        <div className="mt-6">
                            <Button
                                variant="primary"
                                onClick={handleResend}
                                loading={resending}
                                disabled={cooldown > 0}
                                icon="fas fa-paper-plane"
                                fullWidth
                            >
                                {cooldown > 0
                                    ? `Resend in ${Math.floor(cooldown / 60)}m ${cooldown % 60}s`
                                    : 'Resend Verification Email'}
                            </Button>
                        </div>
                    )}

                    <div className="mt-6">
                        <Button
                            variant="secondary"
                            onClick={() => router.push('/auth/login')}
                            fullWidth
                        >
                            Back to Login
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense
            fallback={<LoadingScreen message="Loading verification page..." />}
        >
            <VerifyEmailContent />
        </Suspense>
    )
}
