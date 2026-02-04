'use client'

import React, { memo } from 'react'
import Link from 'next/link'
import { News } from '@fluxo/types'

interface NewsCardProps {
    news: News
}

function NewsCard({ news }: NewsCardProps) {
    const formatDate = (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const truncateSummary = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text
        return text.slice(0, maxLength) + '...'
    }

    const isUnread = (news as { isRead?: boolean }).isRead === false

    return (
        <Link href={`/client/news/${news.metadata.slug}`}>
            <div className="group relative h-44 cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]">
                {isUnread && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-primary-400 h-3 w-3 animate-pulse rounded-full border-2 border-black"></div>
                    </div>
                )}

                {news.metadata?.featuredImageUrl ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center brightness-50 transition-all group-hover:brightness-60"
                        style={{
                            backgroundImage: `url(${news.metadata.featuredImageUrl})`,
                        }}
                    />
                ) : (
                    <div className="from-primary-800/40 absolute inset-0 bg-gradient-to-br via-zinc-900 to-black" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            {news.isFeatured && (
                                <span className="inline-flex items-center rounded border border-yellow-500/50 bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
                                    <i className="fas fa-star mr-1 text-xs"></i>
                                    Featured
                                </span>
                            )}
                            {news.tags && news.tags.length > 0 && (
                                <span className="inline-flex items-center rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
                                    {news.tags[0]}
                                </span>
                            )}
                        </div>
                        <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-white">
                            {news.title}
                        </h3>
                        <p className="line-clamp-2 text-xs text-zinc-400">
                            {truncateSummary(news.summary)}
                        </p>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            {news.author && news.author.length > 0 && (
                                <>
                                    <p className="mb-0.5 text-xs tracking-wider text-zinc-400 uppercase">
                                        Author
                                    </p>
                                    <p className="text-sm font-semibold text-white">
                                        @{news.author[0].username}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="mb-0.5 text-xs tracking-wider text-zinc-400 uppercase">
                                Published
                            </p>
                            <p className="text-sm font-semibold text-white">
                                {formatDate(
                                    news.timestamps.publishedAt ||
                                        news.timestamps.createdAt
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default memo(NewsCard)
