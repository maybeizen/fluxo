import { Router, type Router as RouterType } from 'express'
import usersRoutes from './users/routes'
import servicesRoutes from './services/routes'
import newsRoutes from './news/routes'
import couponsRoutes from './coupons/routes'
import productsRoutes from './products/routes'
import categoriesRoutes from './categories/routes'
import settingsRoutes from './settings/routes'
import ticketsRoutes from './tickets/routes'
import invoicesRoutes from './invoices/routes'
import pterodactylRoutes from './pterodactyl/routes'
import pluginsRoutes from './plugins/routes'
import { requireAdmin } from '../../../middleware/requireAdmin'
import { requireAdminOnly } from '../../../middleware/requireAdminOnly'

const router: RouterType = Router()

router.use('/users', requireAdmin, usersRoutes)
router.use('/services', requireAdmin, servicesRoutes)
router.use('/news', requireAdmin, newsRoutes)
router.use('/coupons', requireAdmin, couponsRoutes)
router.use('/products', requireAdmin, productsRoutes)
router.use('/categories', requireAdmin, categoriesRoutes)
router.use('/settings', requireAdminOnly, settingsRoutes)
router.use('/tickets', requireAdmin, ticketsRoutes)
router.use('/invoices', requireAdmin, invoicesRoutes)
router.use('/pterodactyl', requireAdmin, pterodactylRoutes)
router.use('/plugins', requireAdminOnly, pluginsRoutes)

export default router
