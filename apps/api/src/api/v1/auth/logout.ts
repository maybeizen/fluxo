import { Request, Response } from 'express'
import { logger } from '../../../utils/logger'

export const logout = async (req: Request, res: Response) => {
    try {
        if (!req.session.userId) {
            return res
                .status(401)
                .json({ success: false, message: 'Not authenticated' })
        }

        req.session.destroy((err) => {
            if (err) {
                logger.error(`Error during user logout - ${err}`)
                return res
                    .status(500)
                    .json({ success: false, message: 'Internal server error' })
            }
        })

        res.clearCookie('connect.sid')
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        })
    } catch (error) {
        logger.error(`Error during user logout - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
