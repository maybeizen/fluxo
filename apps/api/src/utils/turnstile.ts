import axios from 'axios'
import { getSettings } from './get-settings'
import { decrypt } from './encryption'
import { logger } from './logger'

interface TurnstileVerificationResponse {
    success: boolean
    'error-codes'?: string[]
    challenge_ts?: string
    hostname?: string
}

export async function verifyTurnstileToken(
    token: string,
    remoteip?: string
): Promise<boolean> {
    try {
        const settings = await getSettings()
        const cloudflare = settings?.security?.cloudflare
        const isEnabled = cloudflare?.turnstileEnabled ?? false

        if (!isEnabled) {
            return true
        }

        const secretKey = cloudflare?.turnstileSecretKey

        if (!secretKey) {
            return true
        }

        const decryptedSecretKey = decrypt(secretKey)

        if (!decryptedSecretKey) {
            logger.error('Failed to decrypt Turnstile secret key')
            return false
        }

        const response = await axios.post<TurnstileVerificationResponse>(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                secret: decryptedSecretKey,
                response: token,
                remoteip,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        if (!response.data.success) {
            logger.warn(
                `Turnstile verification failed: ${response.data['error-codes']?.join(', ')}`
            )
            return false
        }

        return true
    } catch (error) {
        logger.error(`Error verifying Turnstile token: ${error}`)
        return false
    }
}
