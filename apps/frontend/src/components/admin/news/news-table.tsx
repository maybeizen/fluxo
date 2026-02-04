'use client'

import React from 'react'
import { News, NewsVisibility } from '@fluxo/types'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useNotifications } from '@/context/notification-context'

interface NewsTableProps {
    news: News[]
    isLoading?: boolean
    onEdit?: (newsId: string) => void
    onDelete?: (newsId: string) => void
    className?: string
}

export default function NewsTable({
    news,
    isLoading = false,
    onEdit,
    onDelete,
    className = '',
}: NewsTableProps) {
    const notifications = useNotifications()

    const handleCopyId = async (newsId: string) => {
        try {
            await navigator.clipboard.writeText(newsId)
            notifications.success('News ID copied to clipboard')
        } catch (error) {
            console.error('Failed to copy ID:', error)
            notifications.error('Failed to copy ID')
        }
    }

    const getVisibilityBadge = (visibility: NewsVisibility) => {
        const colors = {
            [NewsVisibility.PUBLIC]:
                'bg-green-500/10 text-green-500 border-green-500/20',
            [NewsVisibility.DRAFT]:
                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            [NewsVisibility.PRIVATE]:
                'bg-blue-500/10 text-blue-500 border-blue-500/20',
            [NewsVisibility.ARCHIVED]:
                'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        }

        return (
            <span
                className={`rounded border px-2 py-1 text-xs font-medium ${colors[visibility]}`}
            >
                {visibility}
            </span>
        )
    }

    const formatDate = (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
            </div>
        )
    }

    if (news.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
                    <i className="fas fa-newspaper text-2xl text-zinc-600"></i>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                    No News Found
                </h3>
                <p className="max-w-md text-sm text-zinc-400">
                    No news articles match your current filters. Try adjusting
                    your search criteria.
                </p>
            </div>
        )
    }

    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-zinc-800">
                        <th className="w-24 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Title
                        </th>
                        <th className="w-32 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Visibility
                        </th>
                        <th className="w-24 px-4 py-3 text-center text-sm font-medium text-zinc-400">
                            Featured
                        </th>
                        <th className="w-32 px-4 py-3 text-left text-sm font-medium text-zinc-400">
                            Published
                        </th>
                        <th className="w-32 px-4 py-3 text-right text-sm font-medium text-zinc-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {news.map((article, index) => (
                        <tr
                            key={article.uuid || `news-${index}`}
                            className="border-b border-zinc-900 transition-colors hover:bg-zinc-900/50"
                        >
                            <td className="px-4 py-3">
                                <div
                                    className="group flex w-fit cursor-pointer items-center gap-2 transition-colors hover:text-white"
                                    onClick={() => handleCopyId(article.uuid)}
                                    title="Click to copy ID"
                                >
                                    <span className="font-mono text-xs text-zinc-400 group-hover:text-white">
                                        {article.uuid}
                                    </span>
                                    <i className="fas fa-copy flex-shrink-0 text-xs text-zinc-600 group-hover:text-zinc-400"></i>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="hover:text-primary-400 max-w-md truncate text-sm font-medium text-white transition-colors">
                                        {article.title}
                                    </span>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="max-w-xs truncate text-xs text-zinc-500">
                                            {article.summary}
                                        </span>
                                        {article.isFeatured && (
                                            <span className="text-xs text-yellow-500">
                                                <i className="fas fa-star"></i>
                                            </span>
                                        )}
                                    </div>
                                    {article.tags &&
                                        article.tags.length > 0 && (
                                            <div className="mt-1 flex flex-wrap items-center gap-1">
                                                {article.tags
                                                    .slice(0, 3)
                                                    .map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                {article.tags.length > 3 && (
                                                    <span className="text-xs text-zinc-500">
                                                        +
                                                        {article.tags.length -
                                                            3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                {getVisibilityBadge(article.visibility)}
                            </td>
                            <td className="px-4 py-3 text-center">
                                {article.isFeatured ? (
                                    <span className="text-yellow-500">
                                        <i className="fas fa-star"></i>
                                    </span>
                                ) : (
                                    <span className="text-zinc-600">
                                        <i className="far fa-star"></i>
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-zinc-400">
                                {article.timestamps.publishedAt
                                    ? formatDate(article.timestamps.publishedAt)
                                    : 'Not published'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(article.uuid)}
                                            className="px-3"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="fail"
                                            size="sm"
                                            onClick={() =>
                                                onDelete(article.uuid)
                                            }
                                            className="px-3"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
