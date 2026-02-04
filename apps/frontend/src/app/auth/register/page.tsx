'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { postWithErrors } from '@/utils/post-handle'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input/input'
import Logo from '@/components/ui/logo'
import InputLabel from '@/components/ui/input/input-label'
import InputError from '@/components/ui/input/input-error'
import Turnstile, { TurnstileRef } from '@/components/ui/turnstile'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/context/notification-context'
import { registerSchema, RegisterFormData } from '@/validators/auth/register'
import useFormValidation from '@/hooks/use-form-validation'
import { getTurnstileSiteKey } from '@/lib/turnstile'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [loading, setLoading] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
    const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(
        null
    )
    const turnstileRef = useRef<TurnstileRef>(null)

    const router = useRouter()
    const notifications = useNotifications()
    const { errors, validateAllFields } =
        useFormValidation<RegisterFormData>(registerSchema)

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
            username,
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
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
            interface RegisterResponse {
                success: boolean
                message?: string
            }

            const response = await postWithErrors<RegisterResponse>(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
                formData
            )

            if (response.data?.success) {
                notifications.success(
                    'Registration successful! Check your email to verify your account.'
                )

                setTimeout(() => {
                    router.push(
                        `/auth/verify-email?email=${encodeURIComponent(email)}`
                    )
                }, 1000)
            } else {
                const errorMessage = response.error || 'Registration failed.'
                notifications.error(errorMessage)

                if (
                    errorMessage.includes('Too many') ||
                    errorMessage.includes('15 minutes')
                ) {
                    notifications.error(
                        'Please wait 15 minutes before trying to register again.'
                    )
                }
                if (turnstileSiteKey && turnstileRef.current) {
                    turnstileRef.current.reset()
                    setTurnstileToken(null)
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
                        Create an account
                    </h1>
                    <p className="mb-2 text-center text-base text-zinc-400">
                        Please fill in the details to get started.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <InputLabel htmlFor="username">Username</InputLabel>
                        <Input
                            type="text"
                            id="username"
                            placeholder="johndoe"
                            autoComplete="username"
                            value={username}
                            required
                            onChange={(e) => setUsername(e.target.value)}
                            className={
                                errors.username ? 'border-primary-400' : ''
                            }
                        />
                        <InputError message={errors.username} />
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <InputLabel htmlFor="firstName">First Name</InputLabel>
                        <Input
                            type="text"
                            id="firstName"
                            placeholder="John"
                            autoComplete="given-name"
                            value={firstName}
                            required
                            onChange={(e) => setFirstName(e.target.value)}
                            className={
                                errors.firstName ? 'border-primary-400' : ''
                            }
                        />
                        <InputError message={errors.firstName} />
                    </div>

                    <div className="flex flex-col">
                        <InputLabel htmlFor="lastName">Last Name</InputLabel>
                        <Input
                            type="text"
                            id="lastName"
                            placeholder="Doe"
                            autoComplete="family-name"
                            value={lastName}
                            required
                            onChange={(e) => setLastName(e.target.value)}
                            className={
                                errors.lastName ? 'border-primary-400' : ''
                            }
                        />
                        <InputError message={errors.lastName} />
                    </div>
                </div>

                <div className="flex flex-col">
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <Input
                        type="password"
                        id="password"
                        autoComplete="new-password"
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

                <div className="flex flex-col">
                    <InputLabel htmlFor="confirmPassword">
                        Confirm Password
                    </InputLabel>
                    <Input
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setConfirmPassword(e.target.value)
                        }
                        placeholder="********"
                        className={
                            errors.confirmPassword ? 'border-primary-400' : ''
                        }
                    />
                    <InputError message={errors.confirmPassword} />
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
                    {loading ? 'Creating account...' : 'Register'}
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
                        Already have an account?
                    </p>
                    <a
                        href="/auth/login"
                        className="hover:text-primary-400 text-primary-300 text-xs font-medium transition-colors"
                    >
                        Login
                    </a>
                </div>
            </form>
        </div>
    )
}
