import { Router, type Router as RouterType } from 'express'
import { getAllNews, getNewsById, getNewsBySlug } from './get'
import { createNews } from './create'
import { updateNews } from './update'
import { deleteNews } from './delete'
import { addComment, deleteComment } from './comment'

const router: RouterType = Router()

router.get('/', getAllNews)
router.get('/id/:id', getNewsById)
router.get('/slug/:slug', getNewsBySlug)
router.post('/', createNews)
router.put('/:id', updateNews)
router.delete('/:id', deleteNews)

router.post('/:id/comments', addComment)
router.delete('/:id/comments/:commentId', deleteComment)

export default router
