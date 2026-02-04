'use client'

import React from 'react'
import { News } from '@fluxo/types'
import Link from 'next/link'

interface NewsListItemProps {
    article: News
}

export default function NewsListItem({ article }: NewsListItemProps) {
    const formatDate = (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <Link
            href={`/client/news/${article.metadata.slug}`}
            className="group hover:border-primary-400/50 flex items-start gap-4 rounded-lg border border-zinc-800 bg-black p-4 transition-all duration-300"
        >
            {article.metadata?.featuredImageUrl && (
                <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                    <img
                        src={article.metadata.featuredImageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}

            <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                    {article.isFeatured && (
                        <span className="inline-flex items-center rounded border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                            <i className="fas fa-star mr-1"></i>
                            Featured
                        </span>
                    )}
                    <span className="text-xs text-zinc-500">
                        {formatDate(
                            article.timestamps.publishedAt ||
                                article.timestamps.createdAt
                        )}
                    </span>
                </div>

                <h3 className="group-hover:text-primary-400 mb-2 line-clamp-1 text-lg font-bold text-white transition-colors">
                    {article.title}
                </h3>

                <p className="mb-3 line-clamp-2 text-sm text-zinc-400">
                    {article.summary}
                </p>

                <div className="flex items-center gap-3">
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                            {article.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {article.author && article.author.length > 0 && (
                        <span className="ml-auto text-xs text-zinc-500">
                            <i className="fas fa-user mr-1"></i>@
                            {article.author[0].username}
                        </span>
                    )}
                </div>
            </div>

            <div className="text-primary-400 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <i className="fas fa-arrow-right"></i>
            </div>
        </Link>
    )
}
