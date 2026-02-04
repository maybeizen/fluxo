import { Router, type Router as RouterType } from 'express'
import { getMyInvoices, getMyInvoiceById } from './get'
import { createInvoiceFromCheckout } from './checkout'
import { getInvoicePDF, downloadInvoicePDF } from './pdf'
import { applyCouponToInvoice } from './apply-coupon'
import { removeCouponFromInvoice } from './remove-coupon'

const router: RouterType = Router()

router.get('/', getMyInvoices)
router.get('/:id', getMyInvoiceById)
router.get('/:id/pdf', getInvoicePDF)
router.get('/:id/download', downloadInvoicePDF)
router.post('/checkout', createInvoiceFromCheckout)
router.post('/:id/apply-coupon', applyCouponToInvoice)
router.delete('/:id/coupon', removeCouponFromInvoice)

export default router
