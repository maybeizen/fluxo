import axios from 'axios'
import { User } from '@fluxo/types'

export interface FetchUsersParams {
    page?: number
    limit?: number
    search?: string
    role?: string
    verified?: string
}

export interface FetchUsersResponse {
    users: User[]
    total: number
    page: number
    totalPages: number
}

export async function fetchUsers(
    params: FetchUsersParams = {}
): Promise<FetchUsersResponse> {
    try {
        const queryParams = new URLSearchParams()

        if (params.page) queryParams.append('page', params.page.toString())
        if (params.limit) queryParams.append('limit', params.limit.toString())
        if (params.search) queryParams.append('search', params.search)
        if (params.role) queryParams.append('role', params.role)
        if (params.verified) queryParams.append('verified', params.verified)

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users?${queryParams.toString()}`,
            {
                withCredentials: true,
            }
        )

        return response.data
    } catch (error) {
        console.error('Failed to fetch users:', error)
        return {
            users: [],
            total: 0,
            page: 1,
            totalPages: 0,
        }
    }
}

export async function fetchUserById(userId: string): Promise<User | null> {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users/id/${userId}`,
            {
                withCredentials: true,
            }
        )

        return response.data.user
    } catch (error) {
        console.error('Failed to fetch user:', error)
        return null
    }
}

export async function updateUser(
    userId: string,
    data: Partial<User>
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.put(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
            {
                updates: {
                    username: data.profile?.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role,
                    isVerified: data.isVerified,
                },
            },
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to update user:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to update user',
        }
    }
}

export async function createUser(data: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: string
    isVerified?: boolean
}): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
            data,
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to create user:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to create user',
        }
    }
}

export async function deleteUser(
    userId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to delete user:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to delete user',
        }
    }
}

export async function banUser(
    userId: string,
    referenceId?: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/ban`,
            { referenceId },
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to ban user:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to ban user',
        }
    }
}

export async function unbanUser(
    userId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/unban`,
            {},
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to unban user:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to unban user',
        }
    }
}

export async function ticketBanUser(
    userId: string,
    referenceId?: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/ticket-ban`,
            { referenceId },
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to ticket ban user:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to ticket ban user',
        }
    }
}

export async function ticketUnbanUser(
    userId: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/ticket-unban`,
            {},
            {
                withCredentials: true,
            }
        )
        return { success: true }
    } catch (error: unknown) {
        console.error('Failed to ticket unban user:', error)
        const message =
            error && typeof error === 'object' && 'response' in error
                ? (error.response as { data?: { message?: string } })?.data
                      ?.message
                : undefined
        return {
            success: false,
            message: message || 'Failed to ticket unban user',
        }
    }
}
