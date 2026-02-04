'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { News } from '@/lib/dashboard'
import NewsCard from './news-card'
import LoadingState from '@/components/ui/loading-state'
import EmptyState from '@/components/ui/empty-state'
import Button from '@/components/ui/button'

interface NewsTabProps {
    news: News[]
    isLoading: boolean
    unreadCount: number
    isMarkingAllRead: boolean
    onMarkAllAsRead: () => void
}

export default function NewsTab({
    news,
    isLoading,
    unreadCount,
    isMarkingAllRead,
    onMarkAllAsRead,
}: NewsTabProps) {
    const router = useRouter()

    if (isLoading) {
        return <LoadingState size="md" />
    }

    if (news.length === 0) {
        return (
            <EmptyState
                icon="fas fa-newspaper"
                title="No News Yet"
                description="There aren't any news posts yet. Check back later to see what we have in store!"
                iconSize="sm"
            />
        )
    }

    return (
        <>
            {unreadCount > 0 && (
                <div className="mb-4 flex justify-end">
                    <Button
                        variant="secondary"
                        icon="fas fa-check-double"
                        iconPosition="left"
                        size="sm"
                        onClick={onMarkAllAsRead}
                        loading={isMarkingAllRead}
                    >
                        {isMarkingAllRead ? 'Marking...' : 'Mark All as Read'}
                    </Button>
                </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {news.slice(0, 4).map((article) => (
                    <NewsCard key={article.uuid} news={article} />
                ))}

                {news.length > 4 && (
                    <div className="flex items-center">
                        <Button
                            variant="secondary"
                            icon="fas fa-newspaper"
                            onClick={() => router.push('/client/news')}
                        >
                            View All News
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}
