import { Router, type Router as RouterType } from 'express'

// Gateway webhooks are mounted in app.ts with raw body parsing before JSON middleware
const router: RouterType = Router()

export default router
