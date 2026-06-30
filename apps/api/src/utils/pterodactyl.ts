import axios from 'axios'
import { getDb, settings } from '@fluxo/db'
import { decrypt } from './encryption'
import { logger } from './logger'

export interface PterodactylCredentials {
    baseUrl: string
    apiKey: string
}

export async function getPterodactylCredentials(): Promise<PterodactylCredentials | null> {
    try {
        const db = getDb()
        const [settingsRow] = await db.select().from(settings).limit(1)

        if (
            !settingsRow?.pterodactylBaseUrl ||
            !settingsRow.pterodactylApiKey
        ) {
            return null
        }

        const baseUrl = settingsRow.pterodactylBaseUrl.replace(/\/$/, '')
        const apiKey = decrypt(settingsRow.pterodactylApiKey)

        return { baseUrl, apiKey }
    } catch (error) {
        logger.error(`Error getting Pterodactyl credentials - ${error}`)
        return null
    }
}

export async function pterodactylApiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    data?: unknown
): Promise<T | null> {
    const credentials = await getPterodactylCredentials()
    if (!credentials) {
        throw new Error('Pterodactyl credentials not configured')
    }

    try {
        const response = await axios({
            method,
            url: `${credentials.baseUrl}/api/application/${endpoint}`,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${credentials.apiKey}`,
            },
            data,
            timeout: 10000,
        })

        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error(`Pterodactyl API request failed - ${error.message}`)
            throw error
        }
        throw error
    }
}
