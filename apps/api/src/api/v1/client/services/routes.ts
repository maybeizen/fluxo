import { Router, type Router as RouterType } from 'express'
import { getMyServices, getMyServiceById } from './get'
import { updateMyService } from './update'
import { cancelMyService } from './cancel'

const router: RouterType = Router()

router.get('/', getMyServices)
router.get('/:id', getMyServiceById)
router.put('/:id', updateMyService)
router.post('/:id/cancel', cancelMyService)

export default router
