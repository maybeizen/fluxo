import type { Request, Response } from 'express'
import axios from 'axios'
import { getDb, settings } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { decrypt } from '../../../../utils/encryption'

export const testPterodactylCredentials = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const db = getDb()
        const [settingsRow] = await db.select().from(settings).limit(1)

        if (!settingsRow) {
            res.status(404).json({
                success: false,
                message: 'Settings not found',
            })
            return
        }

        const baseUrl = settingsRow.pterodactylBaseUrl
        const apiKey = settingsRow.pterodactylApiKey
            ? decrypt(settingsRow.pterodactylApiKey)
            : undefined

        if (!baseUrl || !apiKey) {
            res.status(400).json({
                success: false,
                message: 'Pterodactyl base URL and API key must be configured',
            })
            return
        }

        const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
        const apiUrl = `${normalizedBaseUrl}/api/application/users`

        try {
            const response = await axios.get(apiUrl, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                timeout: 10000,
            })

            logger.success('Pterodactyl API credentials validated successfully')
            res.json({
                success: true,
                message: 'Pterodactyl API credentials are valid',
            })
        } catch (axiosError: unknown) {
            if (axios.isAxiosError(axiosError)) {
                const status = axiosError.response?.status
                const statusText = axiosError.response?.statusText

                logger.error(
                    `Pterodactyl API test failed: ${status} - ${statusText}`
                )

                let message = 'Pterodactyl API test failed'
                if (status === 401) {
                    message = 'Invalid API key. Please check your credentials.'
                } else if (status === 404) {
                    message =
                        'API endpoint not found. Please check the base URL.'
                } else if (status === 403) {
                    message = 'API key does not have required permissions.'
                } else if (
                    axiosError.code === 'ECONNREFUSED' ||
                    axiosError.code === 'ENOTFOUND'
                ) {
                    message =
                        'Failed to connect to Pterodactyl API. Please check the base URL.'
                } else if (axiosError.code === 'ETIMEDOUT') {
                    message =
                        'Connection timeout. Please check the base URL and network connectivity.'
                } else {
                    message = `Connection failed: ${statusText || axiosError.message}`
                }

                res.status(400).json({
                    success: false,
                    message,
                })
            } else {
                throw axiosError
            }
        }
    } catch (error) {
        logger.error(`Error testing Pterodactyl credentials - ${error}`)
        res.status(500).json({
            success: false,
            message: 'An error occurred while testing Pterodactyl credentials',
        })
    }
}
