import { Router, type Router as RouterType } from 'express'
import servicesRoutes from './services/routes'
import { validateCoupon } from './coupons/validate-coupon'
import profileRoutes from './profile/routes'
import ticketsRoutes from './tickets/routes'
import productsRoutes from './products/routes'
import invoicesRoutes from './invoices/routes'

const router: RouterType = Router()

router.use('/services', servicesRoutes)
router.use('/profile', profileRoutes)
router.use('/tickets', ticketsRoutes)
router.use('/products', productsRoutes)
router.use('/invoices', invoicesRoutes)
router.post('/validate-coupon', validateCoupon)

export default router
