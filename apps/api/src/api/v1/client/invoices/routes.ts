import { Router, type Router as RouterType } from 'express'
import { getMyInvoices, getMyInvoiceById } from './get'
import { createInvoiceFromCheckout } from './checkout'
import { getInvoicePDF, downloadInvoicePDF } from './pdf'
import { applyCouponToInvoice } from './apply-coupon'
import { removeCouponFromInvoice } from './remove-coupon'
import { payInvoiceHandler } from './pay'
import {
    checkoutRateLimiter,
    couponRateLimiter,
} from '../../../../middleware/rateLimiters'

const router: RouterType = Router()

router.get('/', getMyInvoices)
router.get('/:id', getMyInvoiceById)
router.get('/:id/pdf', getInvoicePDF)
router.get('/:id/download', downloadInvoicePDF)
router.post('/checkout', checkoutRateLimiter, createInvoiceFromCheckout)
router.post('/:id/pay', checkoutRateLimiter, payInvoiceHandler)
router.post('/:id/apply-coupon', couponRateLimiter, applyCouponToInvoice)
router.delete('/:id/coupon', couponRateLimiter, removeCouponFromInvoice)

export default router
