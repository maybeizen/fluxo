'use client'

import React from 'react'
import { News } from '@fluxo/types'
import Link from 'next/link'

interface NewsCardProps {
    article: News
}

export default function NewsCard({ article }: NewsCardProps) {
    const formatDate = (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <Link
            href={`/client/news/${article.metadata.slug}`}
            className="group hover:border-primary-400/50 block overflow-hidden rounded-lg border border-zinc-800 bg-black transition-all duration-300"
        >
            {article.metadata?.featuredImageUrl && (
                <div className="aspect-video overflow-hidden bg-zinc-900">
                    <img
                        src={article.metadata.featuredImageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            )}
            <div className="p-6">
                <div className="mb-3 flex items-center gap-2">
                    {article.isFeatured && (
                        <span className="inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                            <i className="fas fa-star mr-1"></i>
                            Featured
                        </span>
                    )}
                    {article.tags && article.tags.length > 0 && (
                        <>
                            {article.tags.slice(0, 2).map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400"
                                >
                                    {tag}
                                </span>
                            ))}
                        </>
                    )}
                </div>

                <h3 className="group-hover:text-primary-400 mb-2 text-xl font-bold text-white transition-colors">
                    {article.title}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm text-zinc-400">
                    {article.summary}
                </p>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-4">
                        <span>
                            <i className="fas fa-calendar mr-1"></i>
                            {formatDate(
                                article.timestamps.publishedAt ||
                                    article.timestamps.createdAt
                            )}
                        </span>
                        {article.author && article.author.length > 0 && (
                            <span>
                                <i className="fas fa-user mr-1"></i>@
                                {article.author[0].username}
                            </span>
                        )}
                    </div>
                    <span className="text-primary-400 transition-transform group-hover:translate-x-1">
                        Read more <i className="fas fa-arrow-right ml-1"></i>
                    </span>
                </div>
            </div>
        </Link>
    )
}
