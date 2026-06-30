import axios, { type AxiosError } from 'axios'

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

export interface ApiErrorBody {
    success?: boolean
    message?: string
    errors?: Array<{ field?: string; message?: string }>
}

export function getApiErrorMessage(
    error: unknown,
    fallback = 'Request failed'
): string {
    if (!axios.isAxiosError(error)) {
        return error instanceof Error ? error.message : fallback
    }
    const data = error.response?.data as ApiErrorBody | undefined
    if (data?.message) return data.message
    if (data?.errors?.length) {
        return data.errors
            .map((e) => e.message)
            .filter(Boolean)
            .join(', ')
    }
    return fallback
}

export function isApiError(error: unknown): error is AxiosError<ApiErrorBody> {
    return axios.isAxiosError(error)
}
