import axios from 'axios'
import { User } from '@fluxo/types'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

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
    const response = await axios.patch(`${API_URL}/client/profile/me`, data, {
        withCredentials: true,
    })
    return response.data
}

export async function changePassword(data: ChangePasswordData): Promise<void> {
    await axios.post(`${API_URL}/client/profile/me/change-password`, data, {
        withCredentials: true,
    })
}

export async function uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await axios.patch(
        `${API_URL}/client/profile/me/avatar`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
        }
    )
    return response.data.avatarUrl
}

export async function updateAvatarUrl(url: string): Promise<User> {
    const response = await axios.patch(
        `${API_URL}/client/profile/me`,
        { 'profile.avatarUrl': url },
        { withCredentials: true }
    )
    return response.data.profile
}
