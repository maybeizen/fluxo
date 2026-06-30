import { cookies } from 'next/headers'
import { type User } from '@fluxo/types'
import { API_BASE_URL } from '@/lib/api-client'

interface MeResponse {
    success: boolean
    user?: User
}

export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; ')

    try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
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
