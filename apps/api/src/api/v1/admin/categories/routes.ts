import { Router, type Router as RouterType } from 'express'
import { getAllCategories, getCategoryById } from './get'
import { createCategory } from './create'
import { updateCategory } from './update'
import { deleteCategory } from './delete'

const router: RouterType = Router()

router.get('/', getAllCategories)
router.get('/id/:id', getCategoryById)
router.post('/', createCategory)
router.put('/:id', updateCategory)
router.delete('/:id', deleteCategory)

export default router
