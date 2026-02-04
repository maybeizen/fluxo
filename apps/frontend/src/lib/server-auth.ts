import { cookies } from 'next/headers'
import { User } from '@fluxo/types'

interface MeResponse {
    success: boolean
    user?: User
}

export async function getServerUser(): Promise<User | null> {
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; ')

    try {
        const res = await fetch(`${apiUrl}/auth/me`, {
            method: 'GET',
            headers: {
                Cookie: cookieHeader,
            },
            cache: 'no-store',
        })

        if (!res.ok) return null
        const data: MeResponse = await res.json()
        if (data.success && data.user) return data.user
        return null
    } catch {
        return null
    }
}
