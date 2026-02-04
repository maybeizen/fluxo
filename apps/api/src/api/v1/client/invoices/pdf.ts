import { Request, Response } from 'express'
import { getDb, invoices } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { generateInvoicePDF } from '../../../../utils/pdf-generator'

export const getInvoicePDF = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const invoiceId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(invoiceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID',
            })
        }
        const db = getDb()
        const [invoice] = await db
            .select()
            .from(invoices)
            .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
            .limit(1)

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            })
        }

        const pdfBuffer = await generateInvoicePDF(invoice.id)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            `inline; filename="invoice-${invoice.id}.pdf"`
        )
        res.setHeader('Content-Length', pdfBuffer.length.toString())

        res.send(pdfBuffer)
    } catch (error: unknown) {
        logger.error(`Error generating invoice PDF - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export const downloadInvoicePDF = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const invoiceId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(invoiceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID',
            })
        }
        const db = getDb()
        const [invoice] = await db
            .select()
            .from(invoices)
            .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
            .limit(1)

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            })
        }

        const pdfBuffer = await generateInvoicePDF(invoice.id)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="invoice-${invoice.id}.pdf"`
        )
        res.setHeader('Content-Length', pdfBuffer.length.toString())

        res.send(pdfBuffer)
    } catch (error: unknown) {
        logger.error(`Error downloading invoice PDF - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
