'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { fetchNewsById, deleteNews } from '@/lib/admin/news'
import { News } from '@fluxo/types'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'

export default function DeleteNewsPage() {
    const router = useRouter()
    const params = useParams()
    const notifications = useNotifications()
    const newsId = params.id as string

    const [news, setNews] = useState<News | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const loadNews = async () => {
            setIsLoading(true)
            const newsData = await fetchNewsById(newsId)
            if (newsData) {
                setNews(newsData)
            } else {
                notifications.error('News article not found')
                router.push('/admin/news')
            }
            setIsLoading(false)
        }
        loadNews()
    }, [newsId, router])

    const handleDelete = async () => {
        setIsDeleting(true)

        const result = await deleteNews(newsId)

        if (result.success) {
            notifications.success('News article deleted successfully')
            router.push('/admin/news')
        } else {
            notifications.error(
                result.message || 'Failed to delete news article'
            )
            setIsDeleting(false)
        }
    }

    const handleCancel = () => {
        router.push('/admin/news')
    }

    const formatDate = (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
                <div className="mx-auto flex max-w-4xl items-center justify-center py-20">
                    <Spinner size="xl" />
                </div>
            </div>
        )
    }

    if (!news) {
        return null
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 pb-12 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        Delete News Article
                    </h1>
                    <p className="text-zinc-400">
                        Are you sure you want to delete this article? This
                        action cannot be undone.
                    </p>
                </div>

                <div className="border-primary-800/20 rounded-lg border bg-zinc-950 p-8">
                    <div className="mb-6 flex items-start gap-4">
                        <div className="bg-primary-400/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
                            <i className="fas fa-exclamation-triangle text-primary-400 text-2xl"></i>
                        </div>
                        <div className="flex-1">
                            <h2 className="mb-2 text-xl font-semibold text-white">
                                Warning: Permanent Deletion
                            </h2>
                            <p className="text-zinc-400">
                                This will permanently delete the news article
                                and all associated data. This action cannot be
                                undone.
                            </p>
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg border border-zinc-800 bg-black/40 p-6">
                        <h3 className="mb-4 text-lg font-semibold text-white">
                            Article Details
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="min-w-[120px] text-zinc-500">
                                    Title:
                                </span>
                                <span className="font-medium text-white">
                                    {news.title}
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="min-w-[120px] text-zinc-500">
                                    Summary:
                                </span>
                                <span className="text-zinc-400">
                                    {news.summary}
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="min-w-[120px] text-zinc-500">
                                    Slug:
                                </span>
                                <span className="font-mono text-sm text-zinc-400">
                                    {news.metadata?.slug || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="min-w-[120px] text-zinc-500">
                                    Visibility:
                                </span>
                                <span className="text-zinc-400 uppercase">
                                    {news.visibility}
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="min-w-[120px] text-zinc-500">
                                    Featured:
                                </span>
                                <span className="text-zinc-400">
                                    {news.isFeatured ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="min-w-[120px] text-zinc-500">
                                    Created:
                                </span>
                                <span className="text-zinc-400">
                                    {formatDate(news.timestamps.createdAt)}
                                </span>
                            </div>
                            {news.timestamps.publishedAt && (
                                <div className="flex items-start gap-3">
                                    <span className="min-w-[120px] text-zinc-500">
                                        Published:
                                    </span>
                                    <span className="text-zinc-400">
                                        {formatDate(
                                            news.timestamps.publishedAt
                                        )}
                                    </span>
                                </div>
                            )}
                            {news.tags && news.tags.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <span className="min-w-[120px] text-zinc-500">
                                        Tags:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {news.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {news.comments && news.comments.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <span className="min-w-[120px] text-zinc-500">
                                        Comments:
                                    </span>
                                    <span className="text-zinc-400">
                                        {news.comments.length} comment(s)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-primary-800/30 bg-primary-900/20 mb-6 rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <i className="fas fa-info-circle text-primary-400 mt-0.5"></i>
                            <div className="text-primary-100 text-sm">
                                <p className="mb-1 font-semibold">
                                    What will be deleted:
                                </p>
                                <ul className="text-primary-200/80 list-inside list-disc space-y-1">
                                    <li>The article content and metadata</li>
                                    <li>
                                        All comments (
                                        {news.comments?.length || 0})
                                    </li>
                                    <li>All reactions (likes/dislikes)</li>
                                    <li>Associated SEO data</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            variant="ghost"
                            icon="fas fa-xmark"
                            onClick={handleCancel}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="fail"
                            icon="fas fa-trash"
                            onClick={handleDelete}
                            loading={isDeleting}
                        >
                            Delete Article Permanently
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
