import { Router, type Router as RouterType } from 'express'
import { getAllServices, getServiceById } from './get'
import { createService } from './create'
import { updateService } from './update'
import { deleteService } from './delete'

const router: RouterType = Router()

router.get('/', getAllServices)
router.get('/id/:id', getServiceById)
router.post('/', createService)
router.patch('/:id', updateService)
router.delete('/:id', deleteService)

export default router
