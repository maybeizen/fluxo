'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TicketType } from '@fluxo/types'
import { createTicket } from '@/lib/client/tickets'
import { useAuth } from '@/context/auth-context'
import { useNotifications } from '@/context/notification-context'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input/input'
import InputLabel from '@/components/ui/input/input-label'
import MarkdownEditor from '@/components/admin/news/markdown-editor'
import SelectMenu from '@/components/ui/input/select-menu'

export default function NewTicketPage() {
    const router = useRouter()
    const notifications = useNotifications()
    const { user } = useAuth()
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [type, setType] = useState<TicketType>(TicketType.GENERAL)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isTicketBanned = user?.punishment?.isTicketBanned || false

    useEffect(() => {
        if (isTicketBanned) {
            router.replace('/client/support')
        }
    }, [isTicketBanned, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) {
            notifications.error('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)
        try {
            const ticket = await createTicket({ title, content, type })
            notifications.success('Ticket created successfully')
            router.push(`/client/support/${ticket.uuid}`)
        } catch (error: unknown) {
            const message =
                error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined
            notifications.error(message || 'Failed to create ticket')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        Create New Ticket
                    </h1>
                    <p className="text-zinc-400">
                        Get help with your account, services, or billing
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-lg border border-zinc-900 bg-zinc-950 p-8"
                >
                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="title">Title</InputLabel>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Brief description of your issue"
                                className="mt-2"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="type">Type</InputLabel>
                            <div className="mt-2">
                                <SelectMenu
                                    id="type"
                                    value={type}
                                    onChange={(e) =>
                                        setType(e.target.value as TicketType)
                                    }
                                    options={[
                                        {
                                            value: TicketType.GENERAL,
                                            label: 'General',
                                        },
                                        {
                                            value: TicketType.TECHNICAL,
                                            label: 'Account',
                                        },
                                        {
                                            value: TicketType.BILLING,
                                            label: 'Billing',
                                        },
                                        {
                                            value: TicketType.LEGAL,
                                            label: 'Legal',
                                        },
                                        {
                                            value: TicketType.OTHER,
                                            label: 'Other',
                                        },
                                    ]}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="content">
                                Description
                            </InputLabel>
                            <div className="mt-2">
                                <MarkdownEditor
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Describe your issue in detail..."
                                    rows={12}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                loading={isSubmitting}
                            >
                                Create Ticket
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
