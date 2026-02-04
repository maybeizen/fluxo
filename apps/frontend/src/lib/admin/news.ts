import axios from 'axios'
import { News } from '@fluxo/types'

export interface FetchNewsParams {
    page?: number
    limit?: number
    search?: string
    visibility?: string
    isFeatured?: string
    tags?: string
}

export interface FetchNewsResponse {
    news: News[]
    total: number
    page: number
    totalPages: number
}

export async function fetchNews(
    params: FetchNewsParams = {}
): Promise<FetchNewsResponse> {
    try {
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.visibility)
            queryParams.append('visibility', params.visibility)
        if (params.isFeatured)
            queryParams.append('isFeatured', params.isFeatured)
        if (params.tags) queryParams.append('tags', params.tags)

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/news?${queryParams.toString()}`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error) {
        console.error('Failed to fetch news:', error)
        return {
            news: [],
            total: 0,
            page: 1,
            totalPages: 0,
        }
    }
}

export async function fetchNewsById(newsId: string): Promise<News | null> {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/news/id/${newsId}`,
            {
                withCredentials: true,
            }
        )

        return response.data.news
    } catch (error) {
        console.error('Failed to fetch news:', error)
        return null
    }
}

export async function createNews(
    data: Partial<News>
): Promise<{ success: boolean; message?: string; news?: News }> {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/news`,
            data,
            {
                withCredentials: true,
            }
        )
        return { success: true, news: response.data.news }
    } catch (error: unknown) {
        console.error('Failed to create news:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to create news',
        }
    }
}

export async function updateNews(
    newsId: string,
    data: Partial<News>
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/news/${newsId}`,
            data,
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to update news:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to update news',
        }
    }
}

export async function deleteNews(
    newsId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/news/${newsId}`,
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to delete news:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to delete news',
        }
    }
}
