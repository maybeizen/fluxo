import { Request, Response } from 'express'
import { getSettings } from '../../../utils/get-settings'

export const getTurnstileSiteKey = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings()
        const cloudflare = settings?.security?.cloudflare
        const isEnabled = cloudflare?.turnstileEnabled ?? false
        const siteKey = isEnabled ? cloudflare?.turnstileSiteKey : null

        res.status(200).json({
            success: true,
            siteKey: siteKey || null,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch Turnstile site key',
        })
    }
}
