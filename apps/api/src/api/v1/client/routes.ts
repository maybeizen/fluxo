import { Router, type Router as RouterType } from 'express'
import { isBanned } from '../../../middleware/isBanned'
import servicesRoutes from './services/routes'
import { validateCoupon } from './coupons/validate-coupon'
import profileRoutes from './profile/routes'
import ticketsRoutes from './tickets/routes'
import productsRoutes from './products/routes'
import invoicesRoutes from './invoices/routes'
import configurableOptionsRoutes from './configurable-options/routes'
import { couponRateLimiter } from '../../../middleware/rateLimiters'

const router: RouterType = Router()

router.use(isBanned)

router.use('/services', servicesRoutes)
router.use('/configurable-options', configurableOptionsRoutes)
router.use('/profile', profileRoutes)
router.use('/tickets', ticketsRoutes)
router.use('/products', productsRoutes)
router.use('/invoices', invoicesRoutes)
router.post('/validate-coupon', couponRateLimiter, validateCoupon)

export default router
