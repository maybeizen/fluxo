'use client'

import React, { useState, useRef, useEffect } from 'react'
import MarkdownEditor from '@/components/admin/news/markdown-editor'
import Button from '@/components/ui/button'
import { useNotifications } from '@/context/notification-context'

interface TicketReplyBoxProps {
    ticketId: string
    onReply: (content: string) => Promise<void>
    isAdmin?: boolean
}

interface ImagePreview {
    url: string
    file: File
}

export default function TicketReplyBox({
    ticketId,
    onReply,
    isAdmin = false,
}: TicketReplyBoxProps) {
    const notifications = useNotifications()
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const itemRefs = useRef<(HTMLDivElement | null)[]>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const textarea = textareaRef.current
                if (textarea && document.activeElement === textarea) {
                    e.preventDefault()
                    if (
                        !isSubmitting &&
                        (content.trim() || imagePreviews.length > 0)
                    ) {
                        const form = textarea.closest('form')
                        if (form) {
                            form.requestSubmit()
                        }
                    }
                }
            }
        }

        const textarea = textareaRef.current
        if (textarea) {
            textarea.addEventListener('keydown', handleKeyDown)
            return () => {
                textarea.removeEventListener('keydown', handleKeyDown)
            }
        }
    }, [content, imagePreviews.length, isSubmitting])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() && imagePreviews.length === 0) {
            notifications.error('Please enter a message or add an image')
            return
        }

        setIsSubmitting(true)
        try {
            const attachmentUrls: string[] = []

            for (const preview of imagePreviews) {
                const formData = new FormData()
                formData.append('attachment', preview.file)

                try {
                    const endpoint = isAdmin
                        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/tickets/${ticketId}/attachments`
                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/client/tickets/${ticketId}/attachments`

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    })

                    if (!response.ok) throw new Error('Upload failed')

                    const data = await response.json()
                    attachmentUrls.push(data.attachment.fileUrl)
                } catch (error) {
                    notifications.error('Failed to upload image')
                    continue
                }
            }

            let finalContent = content
            if (attachmentUrls.length > 0) {
                const imageMarkdown = attachmentUrls
                    .map((url) => `![Image](${url})`)
                    .join('\n\n')
                finalContent = finalContent
                    ? `${content}\n\n${imageMarkdown}`
                    : imageMarkdown
            }

            await onReply(finalContent)
            setContent('')
            setImagePreviews([])
        } catch (error: unknown) {
            const message =
                error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined
            notifications.error(message || 'Failed to send message')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const allowedTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/webp',
        ]

        files.forEach((file) => {
            if (!allowedTypes.includes(file.type)) {
                notifications.error(
                    `${file.name}: Only PNG, JPG, and WEBP images are allowed`
                )
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                notifications.error(
                    `${file.name}: File size must be less than 5MB`
                )
                return
            }

            if (imagePreviews.length >= 4) {
                notifications.error('Maximum 4 images allowed')
                return
            }

            const url = URL.createObjectURL(file)
            setImagePreviews((prev) => [...prev, { url, file }])
        })

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const removeImage = (index: number) => {
        setImagePreviews((prev) => {
            const newPreviews = prev.filter((_, i) => i !== index)
            newPreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
            return newPreviews
        })
    }

    return (
        <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
            {imagePreviews.length > 0 && (
                <div className="border-b border-zinc-800 bg-zinc-900/50 p-3">
                    <div className="space-y-1.5">
                        {imagePreviews.map((preview, index) => (
                            <div
                                key={index}
                                ref={(el) => {
                                    itemRefs.current[index] = el
                                }}
                                className="group relative flex items-center justify-between rounded-md bg-zinc-800/50 px-3 py-2 transition-colors hover:bg-zinc-800"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <i className="fas fa-image flex-shrink-0 text-sm text-zinc-400"></i>
                                    <span className="flex-1 truncate text-sm text-zinc-300">
                                        {preview.file.name}
                                    </span>
                                    <span className="flex-shrink-0 text-xs text-zinc-500">
                                        {formatFileSize(preview.file.size)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeImage(index)
                                    }}
                                    className="hover:bg-primary-400/20 hover:text-primary-300 ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-zinc-400 transition-colors"
                                >
                                    <i className="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-4">
                    <MarkdownEditor
                        ref={textareaRef}
                        id="reply-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={6}
                        noBorder={true}
                    />

                    <div className="flex items-center justify-between">
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleFileSelect}
                                multiple
                                className="hidden"
                                id="ticket-attachment"
                            />
                            <label htmlFor="ticket-attachment">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon="fas fa-image"
                                    iconPosition="left"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={
                                        isSubmitting ||
                                        imagePreviews.length >= 4
                                    }
                                >
                                    {imagePreviews.length > 0
                                        ? `${imagePreviews.length}/4 Images`
                                        : 'Add Image'}
                                </Button>
                            </label>
                        </div>
                        <Button
                            variant="primary"
                            type="submit"
                            loading={isSubmitting}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
