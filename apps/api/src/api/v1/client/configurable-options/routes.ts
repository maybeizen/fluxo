import { Router, type Router as RouterType } from 'express'
import { getConfigurableOptionsForProduct } from './get-for-product'

const router: RouterType = Router()

router.get('/', getConfigurableOptionsForProduct)

export default router
