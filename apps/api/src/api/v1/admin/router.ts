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
import configurableOptionsRoutes from './configurable-options/routes'
import { requireAdminOnly } from '../../../middleware/requireAdminOnly'

const router: RouterType = Router()

router.use('/users', usersRoutes)
router.use('/services', servicesRoutes)
router.use('/news', newsRoutes)
router.use('/coupons', couponsRoutes)
router.use('/products', productsRoutes)
router.use('/categories', categoriesRoutes)
router.use('/settings', requireAdminOnly, settingsRoutes)
router.use('/tickets', ticketsRoutes)
router.use('/invoices', invoicesRoutes)
router.use('/pterodactyl', pterodactylRoutes)
router.use('/plugins', requireAdminOnly, pluginsRoutes)
router.use('/configurable-options', configurableOptionsRoutes)

export default router
