import { Request, Response } from 'express'
import { getDb, tickets } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { ticketCache } from '../../../../utils/cache'
import { uploadTicketAttachment } from '../../../../utils/multer-ticket'
import { env } from '../../../../utils/env'
import { v4 as uuidv4 } from 'uuid'
import { TicketAttachment } from '@fluxo/types'

export const uploadAttachment = async (req: Request, res: Response) => {
    uploadTicketAttachment(req, res, async (err) => {
        try {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Failed to upload attachment',
                })
            }

            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                })
            }

            const userId = req.userId

            const ticketId = parseInt(
                Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
                10
            )
            if (isNaN(ticketId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ticket ID',
                })
            }

            const db = getDb()
            const [ticket] = await db
                .select()
                .from(tickets)
                .where(
                    and(eq(tickets.id, ticketId), eq(tickets.userId, userId))
                )
                .limit(1)

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found or access denied',
                })
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                })
            }

            const attachmentUrl = `${env.API_URL}/uploads/tickets/${req.file.filename}`
            const attachment: TicketAttachment = {
                uuid: uuidv4(),
                ticketUuid: ticketId.toString(),
                fileUrl: attachmentUrl,
                createdAt: new Date(),
            }

            await ticketCache.delPattern(`client:${userId}:*`)
            await ticketCache.del(`client:${userId}:${ticketId}`)

            res.status(200).json({
                success: true,
                message: 'Attachment uploaded successfully',
                attachment,
            })
        } catch (error: unknown) {
            logger.error(`Error uploading attachment - ${error}`)

            res.status(500).json({
                success: false,
                message: 'Internal server error',
            })
        }
    })
}
