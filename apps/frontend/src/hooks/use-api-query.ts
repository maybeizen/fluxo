'use client'

import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '@/lib/api-client'

interface UseApiQueryOptions<T> {
    enabled?: boolean
    onSuccess?: (data: T) => void
    onError?: (message: string) => void
}

interface UseApiQueryResult<T> {
    data: T | null
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useApiQuery<T>(
    fetcher: () => Promise<T>,
    deps: unknown[] = [],
    options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
    const { enabled = true, onSuccess, onError } = options
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(enabled)
    const [error, setError] = useState<string | null>(null)

    const refetch = useCallback(async () => {
        if (!enabled) return
        setIsLoading(true)
        setError(null)
        try {
            const result = await fetcher()
            setData(result)
            onSuccess?.(result)
        } catch (err) {
            const message = getApiErrorMessage(err)
            setError(message)
            onError?.(message)
        } finally {
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, fetcher, ...deps])

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
                const result = await fetcher()
                if (!cancelled) {
                    setData(result)
                    onSuccess?.(result)
                }
            } catch (err) {
                if (!cancelled) {
                    const message = getApiErrorMessage(err)
                    setError(message)
                    onError?.(message)
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, ...deps])

    return { data, isLoading, error, refetch }
}
