import { type Request, type Response } from 'express'
import { getDb, tickets } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { ticketCache } from '../../../../utils/cache'
import {
    uploadTicketAttachment,
    validateUploadedFileMagic,
} from '../../../../utils/upload'
import { getStorageDriver } from '../../../../utils/storage'
import { v4 as uuidv4 } from 'uuid'
import { type TicketAttachment, TicketStatus } from '@fluxo/types'
import { processImage } from '../../../../utils/image'

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
                .where(eq(tickets.id, ticketId))
                .limit(1)

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    message: 'Ticket not found',
                })
            }

            if (ticket.status === TicketStatus.CLOSED) {
                return res.status(400).json({
                    success: false,
                    message: 'Ticket is closed',
                })
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                })
            }

            if (
                !validateUploadedFileMagic(req.file.buffer, req.file.mimetype)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file content',
                })
            }

            const driver = await getStorageDriver()
            const baseKey = `tickets/${uuidv4()}`
            const variants = await processImage(req.file.buffer, {
                sizes: ['full'],
                cap: 1280,
            })

            await driver.saveVariants(
                baseKey,
                variants.map((variant) => ({
                    size: variant.size,
                    buffer: variant.buffer,
                }))
            )

            const fileUrl = driver.resolveUrl(baseKey, 'full')

            const attachment: TicketAttachment = {
                uuid: uuidv4(),
                ticketUuid: ticketId.toString(),
                fileUrl,
                createdAt: new Date(),
            }

            await ticketCache.delPattern('admin:*')
            await ticketCache.delPattern(`client:${ticket.userId}:*`)
            await ticketCache.del(`admin:${ticketId}`)
            await ticketCache.del(`client:${ticket.userId}:${ticketId}`)

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
