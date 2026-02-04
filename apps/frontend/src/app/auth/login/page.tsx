'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { postWithErrors } from '@/utils/post-handle'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input/input'
import Checkbox from '@/components/ui/input/checkbox'
import Logo from '@/components/ui/logo'
import InputLabel from '@/components/ui/input/input-label'
import InputError from '@/components/ui/input/input-error'
import Turnstile, { TurnstileRef } from '@/components/ui/turnstile'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/context/notification-context'
import { loginSchema, LoginFormData } from '@/validators/auth/login'
import useFormValidation from '@/hooks/use-form-validation'
import { useAuth } from '@/context/auth-context'
import { getTurnstileSiteKey } from '@/lib/turnstile'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [loading, setLoading] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(
        null
    )
    const turnstileRef = useRef<TurnstileRef>(null)

    const router = useRouter()
    const notifications = useNotifications()
    const { refreshAuth } = useAuth()
    const { errors, validateAllFields } =
        useFormValidation<LoginFormData>(loginSchema)

    useEffect(() => {
        const loadTurnstileSiteKey = async () => {
            const siteKey = await getTurnstileSiteKey()
            setTurnstileSiteKey(siteKey)
        }
        loadTurnstileSiteKey()
    }, [])

    const handleTurnstileSuccess = useCallback((token: string) => {
        setTurnstileToken(token)
    }, [])

    const handleTurnstileError = useCallback(() => {
        setTurnstileToken(null)
        notifications.error('Security verification failed. Please try again.')
    }, [])

    const handleTurnstileExpire = useCallback(() => {
        setTurnstileToken(null)
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = {
            email,
            password,
            remember,
            turnstileToken: turnstileToken || undefined,
        }
        const { isValid } = validateAllFields(formData)

        if (!isValid) {
            return
        }

        if (turnstileSiteKey && !turnstileToken) {
            notifications.error('Please complete the security verification')
            return
        }

        setLoading(true)

        try {
            interface LoginResponse {
                success: boolean
                user?: {
                    profile: {
                        username?: string
                    }
                }
            }

            const response = await postWithErrors<LoginResponse>(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
                formData
            )

            if (response.data?.success) {
                notifications.success(
                    `Welcome back, ${response.data?.user?.profile.username}!` ||
                        'Logged in successfully.'
                )
                await refreshAuth()
                setTimeout(() => {
                    router.push('/client')
                }, 2500)
            } else {
                const errorMessage = response.error || 'Login failed.'

                if (errorMessage.includes('verify your email')) {
                    router.push(
                        `/auth/verify-email?email=${encodeURIComponent(email)}`
                    )
                } else {
                    notifications.error(errorMessage)
                    if (turnstileSiteKey && turnstileRef.current) {
                        turnstileRef.current.reset()
                        setTurnstileToken(null)
                    }
                }
            }
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred.'
            notifications.error(message)
            if (turnstileSiteKey && turnstileRef.current) {
                turnstileRef.current.reset()
                setTurnstileToken(null)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full max-w-md flex-col items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-3 rounded-lg border border-zinc-900 bg-zinc-950 p-6 shadow-lg"
            >
                <div className="flex flex-col items-center justify-center gap-1">
                    <Logo className="mb-2 h-10 w-10" />
                    <h1 className="text-center text-2xl font-bold text-white">
                        Welcome back
                    </h1>
                    <p className="mb-2 text-center text-base text-zinc-400">
                        Please enter your email and password to continue.
                    </p>
                </div>

                <div className="flex flex-col">
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <Input
                        type="email"
                        id="email"
                        placeholder="email@example.com"
                        autoComplete="email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className={errors.email ? 'border-primary-400' : ''}
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="flex flex-col">
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <Input
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                        }
                        placeholder="********"
                        className={errors.password ? 'border-primary-400' : ''}
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="mt-2 flex items-center justify-between">
                    <Checkbox
                        label="Remember me"
                        checked={remember}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setRemember(e.target.checked)
                        }
                        containerClassName="mb-0"
                        className="text-sm text-white"
                    />
                    <a
                        href="/forgot-password"
                        className="hover:text-primary-300 text-sm text-zinc-400 transition-colors"
                        tabIndex={0}
                    >
                        Forgot password?
                    </a>
                </div>

                {turnstileSiteKey && (
                    <div className="flex justify-center">
                        <Turnstile
                            ref={turnstileRef}
                            siteKey={turnstileSiteKey}
                            onSuccess={handleTurnstileSuccess}
                            onError={handleTurnstileError}
                            onExpire={handleTurnstileExpire}
                            theme="auto"
                            size="normal"
                        />
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={turnstileSiteKey ? !turnstileToken : false}
                    className="mt-2 w-full rounded-lg py-2 text-base font-medium"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </Button>

                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative bg-zinc-950 px-2">
                        <span className="text-xs text-zinc-500">
                            or continue with
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    icon="fab fa-discord"
                    iconPosition="right"
                    className="mb-4"
                    fullWidth
                    onClick={() => router.push('/auth/discord')}
                >
                    Discord
                </Button>

                <div className="flex items-center justify-center gap-1.5">
                    <p className="text-xs text-zinc-400">
                        Don&apos;t have an account?
                    </p>
                    <a
                        href="/auth/register"
                        className="hover:text-primary-400 text-primary-300 text-xs font-medium transition-colors"
                    >
                        Register
                    </a>
                </div>
            </form>
        </div>
    )
}
