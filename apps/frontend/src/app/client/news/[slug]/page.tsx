'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { News } from '@fluxo/types'
import { fetchNewsBySlug } from '@/lib/news'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import remarkGfm from 'remark-gfm'

const ReactMarkdown = dynamic(
    () => import('react-markdown').then((mod) => mod.default),
    {
        loading: () => <div className="text-zinc-400">Loading content...</div>,
        ssr: false,
    }
)
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import axios from 'axios'
import { useNotifications } from '@/context/notification-context'

export default function ClientNewsArticlePage() {
    const params = useParams()
    const router = useRouter()
    const slug = params.slug as string

    const [article, setArticle] = useState<News | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLiking, setIsLiking] = useState(false)
    const [isDisliking, setIsDisliking] = useState(false)
    const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(
        null
    )
    const notifications = useNotifications()

    const loadArticle = useCallback(async () => {
        setIsLoading(true)
        const data = await fetchNewsBySlug(slug)
        if (data) {
            setArticle(data)
        } else {
            router.push('/client/news')
        }
        setIsLoading(false)
    }, [slug, router])

    const loadUserReaction = useCallback(async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/news/${slug}/reaction`,
                {
                    withCredentials: true,
                }
            )
            if (response.data.success) {
                setUserReaction(response.data.reaction)
            }
        } catch (error) {
            console.error('Failed to load user reaction:', error)
        }
    }, [slug])

    const markAsRead = useCallback(async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/news/${slug}/read`,
                {},
                { withCredentials: true }
            )
        } catch (error) {
            console.error('Failed to mark news as read:', error)
        }
    }, [slug])

    useEffect(() => {
        const loadData = async () => {
            await loadArticle()
            await loadUserReaction()
            await markAsRead()
        }
        loadData()
    }, [loadArticle, loadUserReaction, markAsRead])

    const formatDate = (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const handleLike = async () => {
        if (isLiking || !article) return

        setIsLiking(true)
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/news/${slug}/like`,
                {},
                { withCredentials: true }
            )

            if (response.data.success && response.data.reactions) {
                setArticle((prev) =>
                    prev
                        ? { ...prev, reactions: response.data.reactions }
                        : null
                )
                if (response.data.removed) {
                    setUserReaction(null)
                } else {
                    setUserReaction('like')
                }
                notifications.success(
                    response.data.message || 'Thanks for your feedback!'
                )
            }
        } catch (error: unknown) {
            console.error('Failed to like article:', error)
            const message =
                error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined
            if (message) {
                notifications.error(message)
            } else {
                notifications.error('Failed to like article')
            }
        } finally {
            setIsLiking(false)
        }
    }

    const handleDislike = async () => {
        if (isDisliking || !article) return

        setIsDisliking(true)
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/news/${slug}/dislike`,
                {},
                { withCredentials: true }
            )

            if (response.data.success && response.data.reactions) {
                setArticle((prev) =>
                    prev
                        ? { ...prev, reactions: response.data.reactions }
                        : null
                )
                if (response.data.removed) {
                    setUserReaction(null)
                } else {
                    setUserReaction('dislike')
                }
                notifications.success(
                    response.data.message || 'Thanks for your feedback!'
                )
            }
        } catch (error: unknown) {
            console.error('Failed to dislike article:', error)
            const message =
                error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined
            if (message) {
                notifications.error(message)
            } else {
                notifications.error('Failed to dislike article')
            }
        } finally {
            setIsDisliking(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black p-4 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="xl" />
                    </div>
                </div>
            </div>
        )
    }

    if (!article) {
        return null
    }

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/client/news')}
                        icon="fas fa-arrow-left"
                    >
                        Back to News
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <div className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8">
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                            {article.isFeatured && (
                                <span className="inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-500">
                                    <i className="fas fa-star mr-2"></i>
                                    Featured
                                </span>
                            )}
                            {article.tags && article.tags.length > 0 && (
                                <>
                                    {article.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-sm font-medium text-zinc-400"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </>
                            )}
                        </div>

                        <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                            {article.title}
                        </h1>

                        <p className="mb-6 text-lg text-zinc-400">
                            {article.summary}
                        </p>

                        <div className="flex items-center gap-6 text-zinc-500">
                            {article.author && article.author.length > 0 && (
                                <div className="flex items-center gap-2">
                                    {article.author[0].avatarUrl ? (
                                        <Image
                                            src={article.author[0].avatarUrl}
                                            alt={
                                                article.author[0].name ||
                                                'Author'
                                            }
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                                            <i className="fas fa-user text-zinc-600"></i>
                                        </div>
                                    )}
                                    <span className="text-white">
                                        @{article.author[0].username}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <i className="fas fa-calendar"></i>
                                <span>
                                    {formatDate(
                                        article.timestamps.publishedAt ||
                                            article.timestamps.createdAt
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {article.metadata?.featuredImageUrl && (
                        <div className="border-b border-zinc-800 p-8">
                            <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800">
                                <Image
                                    src={article.metadata.featuredImageUrl}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                                />
                            </div>
                        </div>
                    )}

                    <div className="p-8">
                        <div className="prose">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {article.content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 p-8">
                        <div className="flex items-center gap-4">
                            <span className="text-zinc-400">
                                Was this article helpful?
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                        userReaction === 'like'
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                    }`}
                                >
                                    {isLiking ? (
                                        <Spinner
                                            size="sm"
                                            className="mr-2 text-white"
                                        />
                                    ) : (
                                        <i
                                            className={`fas fa-thumbs-up mr-2`}
                                        ></i>
                                    )}
                                    {article.reactions?.likes || 0}
                                </button>
                                <button
                                    onClick={handleDislike}
                                    disabled={isDisliking}
                                    className={`rounded-lg px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                        userReaction === 'dislike'
                                            ? 'bg-primary-500 hover:bg-primary-600 text-white'
                                            : 'bg-zinc-900 text-white hover:bg-zinc-800'
                                    }`}
                                >
                                    {isDisliking ? (
                                        <Spinner
                                            size="sm"
                                            className="mr-2 text-white"
                                        />
                                    ) : (
                                        <i
                                            className={`fas fa-thumbs-down mr-2`}
                                        ></i>
                                    )}
                                    {article.reactions?.dislikes || 0}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 p-8">
                        <h2 className="mb-6 text-xl font-bold text-white">
                            Comments
                        </h2>

                        <div className="relative">
                            <div className="pointer-events-none space-y-4 opacity-50">
                                <textarea
                                    className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-white placeholder-zinc-500"
                                    rows={4}
                                    placeholder="Share your thoughts..."
                                    disabled
                                />
                                <button className="bg-primary-400 rounded-lg px-6 py-2 font-medium text-white">
                                    <i className="fas fa-comment mr-2"></i>
                                    Post Comment
                                </button>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm">
                                <div className="max-w-md rounded-lg border-2 border-yellow-500/50 bg-zinc-900 p-6 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                                        <i className="fas fa-wrench text-3xl text-yellow-500"></i>
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-white">
                                        Coming Soon
                                    </h3>
                                    <p className="text-sm text-zinc-400">
                                        The comment feature is currently in
                                        development and will be released soon.
                                        Stay tuned!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {article.comments && article.comments.length > 0 && (
                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-semibold text-white">
                                    {article.comments.length}{' '}
                                    {article.comments.length === 1
                                        ? 'Comment'
                                        : 'Comments'}
                                </h3>
                                {article.comments.map((comment) => (
                                    <div
                                        key={comment.uuid}
                                        className="rounded-lg border border-zinc-800 bg-black p-6"
                                    >
                                        <div className="flex items-start gap-4">
                                            {comment.author.avatarUrl ? (
                                                <img
                                                    src={
                                                        comment.author.avatarUrl
                                                    }
                                                    alt={comment.author.name}
                                                    className="h-10 w-10 flex-shrink-0 rounded-full"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800">
                                                    <i className="fas fa-user text-zinc-600"></i>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="font-medium text-white">
                                                        @
                                                        {
                                                            comment.author
                                                                .username
                                                        }
                                                    </span>
                                                    <span className="text-xs text-zinc-500">
                                                        {formatDate(
                                                            comment.createdAt
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-zinc-400">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
