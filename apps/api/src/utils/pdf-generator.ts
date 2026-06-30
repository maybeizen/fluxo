import PDFDocument from 'pdfkit'
import { InvoiceStatus } from '@fluxo/types'
import { getDb, users, invoices, invoiceItems } from '@fluxo/db'
import { eq } from '@fluxo/db'

export const generateInvoicePDF = async (
    invoiceId: number
): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = getDb()
            const [invoice] = await db
                .select()
                .from(invoices)
                .where(eq(invoices.id, invoiceId))
                .limit(1)

            if (!invoice) {
                reject(new Error('Invoice not found'))
                return
            }

            const [user] = await db
                .select({
                    email: users.email,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    username: users.username,
                })
                .from(users)
                .where(eq(users.id, invoice.userId))
                .limit(1)

            const items = await db
                .select()
                .from(invoiceItems)
                .where(eq(invoiceItems.invoiceId, invoice.id))

            const doc = new PDFDocument({
                margin: 50,
                size: 'LETTER',
            })
            const buffers: Buffer[] = []

            doc.on('data', buffers.push.bind(buffers))
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers)
                resolve(pdfBuffer)
            })
            doc.on('error', reject)

            const pageWidth = doc.page.width
            const pageHeight = doc.page.height
            const margin = 50
            const contentWidth = pageWidth - margin * 2

            doc.fillColor('#E5E5E5')
            doc.fontSize(60)
            doc.opacity(0.05)
            const watermarkText = `Fluxo #${invoice.id} Invoiced by Fluxo #${invoice.id}`
            for (let y = 100; y < pageHeight - 100; y += 150) {
                for (let x = margin; x < pageWidth - margin; x += 400) {
                    doc.save()
                    doc.translate(x + 200, y + 50)
                    doc.rotate(-45)
                    doc.text(watermarkText, -200, -30, {
                        width: 400,
                        align: 'left',
                    })
                    doc.restore()
                }
            }
            doc.opacity(1)
            doc.fillColor('#000000')

            doc.fontSize(20)
            doc.font('Helvetica-Bold')
            doc.text('Fluxo Invoice Details', margin, 60)

            const statusColor =
                invoice.status === InvoiceStatus.PAID
                    ? '#00FF00'
                    : invoice.status === InvoiceStatus.PENDING
                      ? '#FFA500'
                      : '#FF0000'
            doc.fillColor(statusColor)
            doc.fontSize(14)
            doc.font('Helvetica-Bold')
            doc.text(
                invoice.status.toUpperCase(),
                pageWidth - margin - 100,
                60,
                {
                    width: 100,
                    align: 'right',
                }
            )
            doc.fillColor('#000000')

            let currentY = 100

            const customerName =
                user?.username ||
                (user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Customer') ||
                'Customer'

            doc.fontSize(12)
            doc.font('Helvetica-Bold')
            doc.text('Invoiced To', margin, currentY)
            doc.font('Helvetica')
            currentY += 20
            doc.text(customerName, margin, currentY)
            currentY += 15
            if (user?.email) {
                doc.text(user.email, margin, currentY)
                currentY += 20
            }

            doc.font('Helvetica-Bold')
            doc.text('Pay To', margin + 250, 100)
            doc.font('Helvetica')
            doc.text('Fluxo', margin + 250, 120)
            doc.text('payments@fluxo.cc', margin + 250, 135)

            currentY = 180

            const invoiceDate = new Date(invoice.createdAt)
            const dueDate = new Date(invoice.expiresAt)

            doc.font('Helvetica-Bold')
            doc.fontSize(11)
            doc.text('Invoice Date', margin, currentY)
            doc.font('Helvetica')
            doc.text(
                invoiceDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                margin,
                currentY + 15
            )

            doc.font('Helvetica-Bold')
            doc.text('Due Date', margin + 200, currentY)
            doc.font('Helvetica')
            doc.text(
                dueDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                margin + 200,
                currentY + 15
            )

            currentY = 250

            doc.fontSize(12)
            doc.font('Helvetica-Bold')
            doc.text('Invoice Items', margin, currentY)
            currentY += 25

            const tableStartY = currentY
            const tableEndX = pageWidth - margin
            const tableStartX = margin

            doc.fontSize(10)
            doc.font('Helvetica-Bold')
            doc.text('Description', tableStartX, currentY)
            doc.text('Amount', tableEndX - 100, currentY, {
                width: 100,
                align: 'right',
            })
            currentY += 15

            doc.moveTo(tableStartX, currentY)
                .lineTo(tableEndX, currentY)
                .stroke()
            currentY += 10

            doc.font('Helvetica')
            items.forEach((item) => {
                const amount = (item.total / 100).toFixed(2)
                doc.text(item.name, tableStartX, currentY)
                doc.text(`$${amount}`, tableEndX - 100, currentY, {
                    width: 100,
                    align: 'right',
                })
                currentY += 20
            })

            currentY += 10
            doc.moveTo(tableStartX, currentY)
                .lineTo(tableEndX, currentY)
                .stroke()
            currentY += 15

            let subtotal = invoice.amount
            let discount = 0

            if (
                invoice.couponCode &&
                invoice.couponType &&
                invoice.couponValue
            ) {
                if (invoice.couponType === 'percentage') {
                    discount = Math.round(
                        (invoice.amount * invoice.couponValue) / 100
                    )
                } else if (invoice.couponType === 'fixed') {
                    discount = Math.round(invoice.couponValue * 100)
                }
            }

            const finalAmount = Math.max(0, subtotal - discount)

            doc.font('Helvetica-Bold')
            doc.text('Subtotal', tableStartX, currentY)
            doc.font('Helvetica')
            doc.text(
                `$${(subtotal / 100).toFixed(2)}`,
                tableEndX - 100,
                currentY,
                {
                    width: 100,
                    align: 'right',
                }
            )
            currentY += 20

            if (invoice.couponCode) {
                doc.font('Helvetica')
                doc.text(
                    `Coupon (${invoice.couponCode})`,
                    tableStartX,
                    currentY
                )
                doc.text(
                    `-$${(discount / 100).toFixed(2)}`,
                    tableEndX - 100,
                    currentY,
                    {
                        width: 100,
                        align: 'right',
                    }
                )
                currentY += 20
            }

            doc.font('Helvetica-Bold')
            doc.fontSize(12)
            doc.text('Total', tableStartX, currentY)
            doc.text(
                `$${(finalAmount / 100).toFixed(2)}`,
                tableEndX - 100,
                currentY,
                {
                    width: 100,
                    align: 'right',
                }
            )
            currentY += 40

            doc.fontSize(9)
            doc.font('Helvetica')
            doc.text(`Invoice ID: ${invoice.id}`, margin, currentY)
            currentY += 12
            doc.text(
                `Reference ID: ${invoice.transactionId || 'No Transaction ID'}`,
                margin,
                currentY
            )
            currentY += 12

            const createdAt = new Date(invoice.createdAt)
            const createdUTC =
                createdAt.toISOString().replace('T', ' ').substring(0, 19) +
                ' UTC'
            doc.text(`Created At: ${createdUTC}`, margin, currentY)
            currentY += 30

            const now = new Date()
            const estDate = new Date(
                now.toLocaleString('en-US', { timeZone: 'America/New_York' })
            )
            const estFormatted = estDate.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'America/New_York',
            })

            doc.end()
        } catch (error) {
            reject(error)
        }
    })
}
