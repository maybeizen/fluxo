'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import NewsTable from '@/components/admin/news/news-table'
import NewsFiltersComponent, {
    NewsFilters,
} from '@/components/admin/news/news-filters'
import Pagination from '@/components/admin/pagination'
import { fetchNews } from '@/lib/admin/news'
import { News } from '@fluxo/types'

export default function AdminNewsPage() {
    const router = useRouter()
    const [news, setNews] = useState<News[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [filters, setFilters] = useState<NewsFilters>({
        search: '',
        visibility: '',
        isFeatured: '',
    })

    const itemsPerPage = 10

    const loadNews = useCallback(async () => {
        setIsLoading(true)
        const response = await fetchNews({
            page: currentPage,
            limit: itemsPerPage,
            search: filters.search,
            visibility: filters.visibility,
            isFeatured: filters.isFeatured,
        })
        setNews(response.news)
        setTotal(response.total)
        setTotalPages(response.totalPages)
        setIsLoading(false)
    }, [currentPage, filters])

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            setIsLoading(true)
            const response = await fetchNews({
                page: currentPage,
                limit: itemsPerPage,
                search: filters.search,
                visibility: filters.visibility,
                isFeatured: filters.isFeatured,
            })
            if (!cancelled) {
                setNews(response.news)
                setTotal(response.total)
                setTotalPages(response.totalPages)
                setIsLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [currentPage, filters])

    const handleFilterChange = (newFilters: NewsFilters) => {
        setFilters(newFilters)
        setCurrentPage(1)
    }

    const handleEdit = (newsId: string) => {
        router.push(`/admin/news/${newsId}/edit`)
    }

    const handleDelete = (newsId: string) => {
        router.push(`/admin/news/${newsId}/delete`)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleNewNews = () => {
        router.push('/admin/news/new')
    }

    return (
        <div className="min-h-screen bg-black px-4 pt-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                News Management
                            </h1>
                            <p className="text-zinc-400">
                                Manage all news articles and announcements.
                                Total: {total} articles
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleNewNews}
                                icon="fas fa-plus"
                            >
                                New Article
                            </Button>
                        </div>
                    </div>

                    <NewsFiltersComponent
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                    <NewsTable
                        news={news}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
