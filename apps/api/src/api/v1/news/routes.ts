import { Router, type Router as RouterType } from 'express'
import {
    getPublishedNews,
    getFeaturedNews,
    getPublishedNewsBySlug,
    getTags,
} from './get'
import { addPublicComment } from './comment'
import { likeNews, dislikeNews, getUserReaction } from './reactions'
import { markNewsAsRead, markAllNewsAsRead } from './read'
import { requireAuth } from '../../../middleware/requireAuth'
import { isBanned } from '../../../middleware/isBanned'

const router: RouterType = Router()

router.get('/', getPublishedNews)
router.get('/featured', getFeaturedNews)
router.get('/tags', getTags)
router.get('/:slug', getPublishedNewsBySlug)
router.get('/:slug/reaction', getUserReaction)

router.post('/:slug/comments', requireAuth, isBanned, addPublicComment)
router.post('/:slug/like', requireAuth, isBanned, likeNews)
router.post('/:slug/dislike', requireAuth, isBanned, dislikeNews)
router.post('/:slug/read', requireAuth, isBanned, markNewsAsRead)
router.post('/mark-all-read', requireAuth, isBanned, markAllNewsAsRead)

export default router
