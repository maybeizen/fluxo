import { apiClient } from '@/lib/api-client'
import { type User } from '@fluxo/types'

export interface UpdateProfileData {
    firstName?: string
    lastName?: string
    email?: string
    'profile.username'?: string
    'profile.headline'?: string
    'profile.about'?: string
    'profile.avatarUrl'?: string
}

export interface ChangePasswordData {
    currentPassword: string
    newPassword: string
}

export interface UpdateProfileResponse {
    profile: User
    emailChanged?: boolean
}

export async function updateProfile(
    data: UpdateProfileData
): Promise<UpdateProfileResponse> {
    const response = await apiClient.patch(`/client/profile/me`, data, {
        withCredentials: true,
    })
    return response.data
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.post(`/client/profile/me/change-password`, data, {
        withCredentials: true,
    })
}

export async function uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await apiClient.patch(
        `/client/profile/me/avatar`,
        formData,
        {
            withCredentials: true,
        }
    )
    return response.data.avatarUrl
}

export async function updateAvatarUrl(url: string): Promise<User> {
    const response = await apiClient.patch(
        `/client/profile/me`,
        { avatarUrl: url },
        { withCredentials: true }
    )
    return response.data.profile
}
