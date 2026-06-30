import { apiClient } from '@/lib/api-client'

export async function initiateDiscordConnection(): Promise<string> {
    const response = await apiClient.get(`/discord/connect`, {})
    return response.data.authUrl
}

export async function disconnectDiscord(): Promise<void> {
    await apiClient.post(
        `/discord/disconnect`,
        {},
        {
            withCredentials: true,
        }
    )
}
