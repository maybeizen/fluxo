import axios from 'axios'

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export async function initiateDiscordConnection(): Promise<string> {
    const response = await axios.get(`${API_URL}/discord/connect`, {
        withCredentials: true,
    })
    return response.data.authUrl
}

export async function disconnectDiscord(): Promise<void> {
    await axios.post(
        `${API_URL}/discord/disconnect`,
        {},
        {
            withCredentials: true,
        }
    )
}
