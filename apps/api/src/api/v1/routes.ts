import { Router, type Router as RouterType } from 'express'
import { requireAuth } from '../../middleware/requireAuth'
import { requireAdmin } from '../../middleware/requireAdmin'

import { healthController } from './health/controller'
import adminRoutes from './admin/router'
import authRoutes from './auth/routes'
import clientRoutes from './client/routes'
import newsRoutes from './news/routes'
import discordRoutes from './discord/routes'
import { getTurnstileSiteKey } from './public/turnstile-site-key'
import { getAppSettings } from './public/app-settings'
import { getGatewayPlugins } from './public/plugins-gateways'
import webhooksRoutes from './webhooks/routes'

const router: RouterType = Router()

router.get('/health', healthController)
router.get('/public/turnstile-site-key', getTurnstileSiteKey)
router.get('/public/app-settings', getAppSettings)
router.get('/public/plugins/gateways', getGatewayPlugins)
router.use('/webhooks', webhooksRoutes)
router.use('/auth', authRoutes)
router.use('/client', requireAuth, clientRoutes)
router.use('/admin', requireAuth, requireAdmin, adminRoutes)
router.use('/news', newsRoutes)
router.use('/discord', discordRoutes)

export default router
