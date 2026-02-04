import { Router, type Router as RouterType } from 'express'
import v1Router from './v1/routes'

const router: RouterType = Router()

router.use('/v1', v1Router)

export default router
