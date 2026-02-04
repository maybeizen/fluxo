'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { News } from '@fluxo/types'
import { fetchPublicNews, fetchFeaturedNews, fetchTags } from '@/lib/news'
import NewsCard from '@/components/client/news/news-card'
import NewsListItem from '@/components/client/news/news-list-item'
import Input from '@/components/ui/input/input'
import Button from '@/components/ui/button'
import Card from '@/components/ui/card'
import EmptyState from '@/components/ui/empty-state'
import LoadingState from '@/components/ui/loading-state'
import Pagination from '@/components/admin/pagination'
import PageHeader from '@/components/client/page-header'

export default function ClientNewsPage() {
    const [news, setNews] = useState<News[]>([])
    const [featuredNews, setFeaturedNews] = useState<News[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [layout, setLayout] = useState<'grid' | 'list'>('grid')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTag, setSelectedTag] = useState('')
    const [availableTags, setAvailableTags] = useState<string[]>([])

    const itemsPerPage = 9

    const loadTags = useCallback(async () => {
        const tags = await fetchTags()
        setAvailableTags(tags)
    }, [])

    const loadFeaturedNews = useCallback(async () => {
        const featured = await fetchFeaturedNews(3)
        setFeaturedNews(featured)
    }, [])

    const loadNews = useCallback(async () => {
        setIsLoading(true)
        const response = await fetchPublicNews({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
            tags: selectedTag,
        })
        setNews(response.news)
        setTotal(response.total)
        setTotalPages(response.totalPages)
        setIsLoading(false)
    }, [currentPage, selectedTag, searchQuery])

    useEffect(() => {
        const loadData = async () => {
            await loadTags()
            await loadFeaturedNews()
        }
        loadData()
    }, [loadTags, loadFeaturedNews])

    useEffect(() => {
        const loadData = async () => {
            await loadNews()
        }
        loadData()
    }, [loadNews])

    const handleSearch = () => {
        setCurrentPage(1)
        loadNews()
    }

    const handleTagFilter = (tag: string) => {
        setSelectedTag(tag === selectedTag ? '' : tag)
        setCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="min-h-screen bg-black p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <PageHeader
                    title="News & Updates"
                    description="Stay up to date with the latest announcements and features"
                />

                {featuredNews.length > 0 && (
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-2">
                            <i className="fas fa-star text-yellow-500"></i>
                            <h2 className="text-xl font-semibold text-white">
                                Featured Articles
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featuredNews.map((article) => (
                                <NewsCard
                                    key={article.uuid}
                                    article={article}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <Card padding="lg">
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                />
                            </div>
                            <Button variant="primary" onClick={handleSearch}>
                                <i className="fas fa-search mr-2"></i>
                                Search
                            </Button>
                            <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
                                <button
                                    onClick={() => setLayout('grid')}
                                    className={`rounded p-2 transition-colors ${
                                        layout === 'grid'
                                            ? 'bg-primary-400 text-white'
                                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                                    }`}
                                    title="Grid view"
                                >
                                    <i className="fas fa-th"></i>
                                </button>
                                <button
                                    onClick={() => setLayout('list')}
                                    className={`rounded p-2 transition-colors ${
                                        layout === 'list'
                                            ? 'bg-primary-400 text-white'
                                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                                    }`}
                                    title="List view"
                                >
                                    <i className="fas fa-list"></i>
                                </button>
                            </div>
                        </div>

                        {availableTags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-zinc-500">
                                    Filter by tag:
                                </span>
                                {availableTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagFilter(tag)}
                                        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                                            selectedTag === tag
                                                ? 'bg-primary-400 text-white'
                                                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                                {selectedTag && (
                                    <button
                                        onClick={() => handleTagFilter('')}
                                        className="text-sm text-zinc-500 transition-colors hover:text-white"
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <LoadingState size="lg" />
                    ) : news.length === 0 ? (
                        <EmptyState
                            icon="fas fa-newspaper"
                            title="No Articles Found"
                            description={
                                searchQuery || selectedTag
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Check back soon for new articles and updates.'
                            }
                        />
                    ) : layout === 'grid' ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {news.map((article) => (
                                <NewsCard
                                    key={article.uuid}
                                    article={article}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {news.map((article) => (
                                <NewsListItem
                                    key={article.uuid}
                                    article={article}
                                />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && !isLoading && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
