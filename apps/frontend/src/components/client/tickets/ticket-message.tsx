'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { TicketMessage, UserRole, UserProfile } from '@fluxo/types'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'

const ReactMarkdown = dynamic(() => import('react-markdown'), {
    ssr: false,
})

interface TicketMessageAuthor {
    uuid: string
    email: string
    profile?: UserProfile
    role?: UserRole
}

interface TicketMessageProps {
    message: TicketMessage & {
        author?: TicketMessageAuthor
    }
    isOwnMessage?: boolean
}

const extractImages = (content: string): string[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g
    const images: string[] = []
    let match
    while ((match = imageRegex.exec(content)) !== null) {
        images.push(match[1])
    }
    return images
}

const removeImagesFromContent = (content: string): string => {
    return content.replace(/!\[.*?\]\(.*?\)\s*/g, '').trim()
}

export default function TicketMessageComponent({
    message,
    isOwnMessage = false,
}: TicketMessageProps) {
    const formatDate = (date: Date | string) => {
        const dateObj = new Date(date)
        const now = new Date()
        const diffMs = now.getTime() - dateObj.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year:
                dateObj.getFullYear() !== now.getFullYear()
                    ? 'numeric'
                    : undefined,
        })
    }

    const authorName =
        message.author?.profile?.username ||
        message.author?.email?.split('@')[0] ||
        'Unknown'

    const avatarUrl = message.author?.profile?.avatarUrl as string | undefined

    const initials = authorName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const images = useMemo(
        () => extractImages(message.content),
        [message.content]
    )
    const textContent = useMemo(
        () => removeImagesFromContent(message.content),
        [message.content]
    )
    const hasImages = images.length > 0
    const hasText = textContent.length > 0

    const messageBoxCornerClass = isOwnMessage
        ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm'
        : 'rounded-tr-xl rounded-tl-xl rounded-br-xl rounded-bl-sm'

    return (
        <div
            className={`mb-2 flex items-end px-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} `}
        >
            <div
                className={`flex-shrink-0 ${isOwnMessage ? 'order-2 ml-2' : 'mr-2'}`}
            >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 text-sm font-semibold text-white">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={authorName}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span>{initials}</span>
                    )}
                </div>
            </div>

            <div className={`flex max-w-md min-w-0 flex-col`}>
                <div className="mb-0.5 flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-white">
                        {authorName}
                    </span>
                    {message.author?.role === UserRole.ADMIN && (
                        <span className="border-primary-400/30 bg-primary-400/20 text-primary-300 flex items-center justify-center rounded border px-1 py-0.5 text-[8px] font-bold uppercase">
                            <i className="fas fa-shield-alt"></i>
                        </span>
                    )}
                    {message.author?.role === UserRole.STAFF && (
                        <span className="flex items-center justify-center rounded border border-purple-500/30 bg-purple-500/20 px-1 py-0.5 text-[8px] font-bold text-purple-400 uppercase">
                            <i className="fas fa-headset"></i>
                        </span>
                    )}
                    <span className="text-xs text-zinc-400">
                        {formatDate(message.createdAt)}
                    </span>
                </div>
                <div
                    className={`mt-0 ${messageBoxCornerClass} px-3 py-2 text-sm whitespace-pre-line ${isOwnMessage ? 'bg-primary-700/80 text-white' : 'bg-zinc-800/90 text-white'} border border-zinc-800 shadow-sm`}
                >
                    {hasText && (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ ...props }) => (
                                    <a
                                        {...props}
                                        className="text-blue-300 underline hover:text-blue-200"
                                    />
                                ),
                                code: ({ ...props }) => (
                                    <code
                                        {...props}
                                        className="rounded bg-zinc-700 px-1 text-orange-200"
                                    />
                                ),
                                pre: ({ ...props }) => (
                                    <pre
                                        {...props}
                                        className="my-2 overflow-x-auto rounded bg-zinc-900 p-2"
                                    />
                                ),
                            }}
                        >
                            {textContent}
                        </ReactMarkdown>
                    )}
                    {hasImages && (
                        <div className={`${hasText ? 'mt-2' : ''}`}>
                            {images.length === 1 ? (
                                <a
                                    href={images[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block max-w-md overflow-hidden rounded-lg border border-zinc-700 transition-colors hover:border-zinc-600"
                                >
                                    <Image
                                        src={images[0]}
                                        alt="Attachment"
                                        width={400}
                                        height={400}
                                        unoptimized
                                        className="h-auto max-h-[400px] w-full cursor-pointer object-contain"
                                    />
                                </a>
                            ) : (
                                <div className="grid max-w-md grid-cols-2 gap-2">
                                    {images.map((imgUrl, idx) => (
                                        <a
                                            key={idx}
                                            href={imgUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`overflow-hidden rounded-lg border border-zinc-700 transition-colors hover:border-zinc-600 ${
                                                images.length === 3 && idx === 0
                                                    ? 'col-span-2'
                                                    : ''
                                            }`}
                                        >
                                            <Image
                                                src={imgUrl}
                                                alt={`Attachment ${idx + 1}`}
                                                width={200}
                                                height={200}
                                                unoptimized
                                                className="h-auto max-h-[200px] w-full cursor-pointer object-contain"
                                            />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
