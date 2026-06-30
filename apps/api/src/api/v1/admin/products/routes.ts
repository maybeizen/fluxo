import { Router, type Router as RouterType } from 'express'
import { getAllProducts, getProductById } from './get'
import { createProduct } from './create'
import { updateProduct } from './update'
import { deleteProduct } from './delete'
import { reorderProducts } from './reorder'

const router: RouterType = Router()

router.get('/', getAllProducts)
router.get('/id/:id', getProductById)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.post('/reorder', reorderProducts)
router.delete('/:id', deleteProduct)

export default router
