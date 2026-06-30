'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiErrorMessage } from '@/lib/api-client'

export interface PaginatedResult<TItem> {
    items: TItem[]
    total: number
    totalPages: number
    page: number
}

interface UsePaginatedListOptions<TFilters> {
    itemsPerPage?: number
    initialFilters?: TFilters
    enabled?: boolean
}

interface UsePaginatedListResult<TItem, TFilters> {
    items: TItem[]
    isLoading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    total: number
    filters: TFilters
    setFilters: (filters: TFilters) => void
    setCurrentPage: (page: number) => void
    refetch: () => Promise<void>
}

export function usePaginatedList<TItem, TFilters>(
    fetcher: (params: {
        page: number
        limit: number
        filters: TFilters
    }) => Promise<PaginatedResult<TItem>>,
    options: UsePaginatedListOptions<TFilters> = {}
): UsePaginatedListResult<TItem, TFilters> {
    const {
        itemsPerPage = 10,
        initialFilters = {} as TFilters,
        enabled = true,
    } = options

    const [items, setItems] = useState<TItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [filters, setFiltersState] = useState<TFilters>(initialFilters)

    const fetcherRef = useRef(fetcher)
    useEffect(() => {
        fetcherRef.current = fetcher
    }, [fetcher])

    const load = useCallback(async () => {
        if (!enabled) return
        setIsLoading(true)
        setError(null)
        try {
            const result = await fetcherRef.current({
                page: currentPage,
                limit: itemsPerPage,
                filters,
            })
            setItems(result.items)
            setTotal(result.total)
            setTotalPages(result.totalPages)
        } catch (err) {
            setError(getApiErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, enabled, filters, itemsPerPage])

    useEffect(() => {
        let cancelled = false
        if (!enabled) {
            setIsLoading(false)
            return
        }
        ;(async () => {
            setIsLoading(true)
            setError(null)
            try {
                const result = await fetcherRef.current({
                    page: currentPage,
                    limit: itemsPerPage,
                    filters,
                })
                if (!cancelled) {
                    setItems(result.items)
                    setTotal(result.total)
                    setTotalPages(result.totalPages)
                }
            } catch (err) {
                if (!cancelled) setError(getApiErrorMessage(err))
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [currentPage, enabled, filters, itemsPerPage])

    const setFilters = useCallback((next: TFilters) => {
        setFiltersState(next)
        setCurrentPage(1)
    }, [])

    return {
        items,
        isLoading,
        error,
        currentPage,
        totalPages,
        total,
        filters,
        setFilters,
        setCurrentPage,
        refetch: load,
    }
}
