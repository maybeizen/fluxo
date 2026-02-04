import { Router, type Router as RouterType } from 'express'
import { requireAuth } from '../../../../middleware/requireAuth'
import { getProducts } from './get'

const router: RouterType = Router()

router.get('/', requireAuth, getProducts)

export default router
