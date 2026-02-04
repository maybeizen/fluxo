import axios from 'axios'
import { News } from '@fluxo/types'

export interface FetchPublicNewsParams {
    page?: number
    limit?: number
    search?: string
    tags?: string
    featured?: boolean
}

export interface FetchPublicNewsResponse {
    news: News[]
    total: number
    page: number
    totalPages: number
}

export async function fetchPublicNews(
    params: FetchPublicNewsParams = {}
): Promise<FetchPublicNewsResponse> {
    try {
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.tags) queryParams.append('tags', params.tags)
        if (params.featured !== undefined)
            queryParams.append('featured', params.featured.toString())

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/news?${queryParams.toString()}`,
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

export async function fetchFeaturedNews(limit: number = 3): Promise<News[]> {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/news/featured?limit=${limit}`,
            {
                withCredentials: true,
            }
        )

        return response.data.news || []
    } catch (error) {
        console.error('Failed to fetch featured news:', error)
        return []
    }
}

export async function fetchNewsBySlug(slug: string): Promise<News | null> {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/news/${slug}`,
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

export async function fetchTags(): Promise<string[]> {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/news/tags`,
            {
                withCredentials: true,
            }
        )

        return response.data.tags || []
    } catch (error) {
        console.error('Failed to fetch tags:', error)
        return []
    }
}
