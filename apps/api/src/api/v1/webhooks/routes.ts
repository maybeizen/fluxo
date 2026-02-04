import { Router, type Router as RouterType } from 'express'
import { gatewayWebhook } from './gateway'

const router: RouterType = Router()

router.post('/gateway/:pluginId', gatewayWebhook)

export default router
