import axios from 'axios'
import { Category } from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export interface FetchCategoriesResponse {
    success: boolean
    message: string
    categories: Category[]
}

export interface CategoryResponse {
    success: boolean
    message: string
    category: Category
}

export interface DeleteResponse {
    success: boolean
    message: string
}

export async function fetchCategories(): Promise<Category[]> {
    try {
        const response = await axios.get(`${API_URL}/admin/categories`, {
            withCredentials: true,
        })

        if (response.data.success) {
            return response.data.categories
        }
        return []
    } catch (error) {
        console.error('Failed to fetch categories:', error)
        return []
    }
}

export async function fetchCategoryById(
    categoryId: string
): Promise<Category | null> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/categories/id/${categoryId}`,
            {
                withCredentials: true,
            }
        )

        return response.data.category
    } catch (error) {
        console.error('Failed to fetch category:', error)
        return null
    }
}

export async function createCategory(data: {
    name: string
    description?: string
}): Promise<CategoryResponse> {
    try {
        const response = await axios.post(`${API_URL}/admin/categories`, data, {
            withCredentials: true,
        })

        return response.data
    } catch (error: unknown) {
        console.error('Failed to create category:', error)
        throw error
    }
}

export async function updateCategory(
    categoryId: string,
    updates: { name?: string; description?: string | null }
): Promise<CategoryResponse> {
    try {
        const response = await axios.put(
            `${API_URL}/admin/categories/${categoryId}`,
            updates,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to update category:', error)
        throw error
    }
}

export async function deleteCategory(
    categoryId: string
): Promise<DeleteResponse> {
    try {
        const response = await axios.delete(
            `${API_URL}/admin/categories/${categoryId}`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error: unknown) {
        console.error('Failed to delete category:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to delete category',
        }
    }
}
