import { Router, type Router as RouterType } from 'express'
import { getAllConfigurableOptions, getConfigurableOptionById } from './get'
import { createConfigurableOption } from './create'
import { updateConfigurableOption } from './update'
import { deleteConfigurableOption } from './delete'

const router: RouterType = Router()

router.get('/', getAllConfigurableOptions)
router.get('/id/:id', getConfigurableOptionById)
router.post('/', createConfigurableOption)
router.put('/:id', updateConfigurableOption)
router.delete('/:id', deleteConfigurableOption)

export default router
