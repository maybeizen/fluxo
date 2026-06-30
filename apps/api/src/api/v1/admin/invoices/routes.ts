import { Router, type Router as RouterType } from 'express'
import {
    getAllInvoices,
    getInvoiceById,
    getInvoiceByTransactionId,
} from './get'
import { createInvoice } from './create'
import { updateInvoice } from './update'
import { deleteInvoice } from './delete'
import { getInvoicePDF, downloadInvoicePDF } from './pdf'

const router: RouterType = Router()

router.get('/', getAllInvoices)
router.get('/id/:id', getInvoiceById)
router.get('/transaction/:transactionId', getInvoiceByTransactionId)
router.get('/:id/pdf', getInvoicePDF)
router.get('/:id/download', downloadInvoicePDF)
router.post('/', createInvoice)
router.put('/:id', updateInvoice)
router.delete('/:id', deleteInvoice)

export default router
