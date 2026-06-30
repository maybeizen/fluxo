import { Router, type Router as RouterType } from 'express'
import { getProfile } from './get'
import { me } from './me'
import { updateProfile } from './updateProfile'
import { requireAuth } from '../../../../middleware/requireAuth'
import { isBanned } from '../../../../middleware/isBanned'
import { updateAvatar } from './updateAvatar'
import { changePassword } from './changePassword'
import { profileUpdateRateLimiter } from '../../../../middleware/rateLimiters'

const router: RouterType = Router()

router.get('/:username', getProfile)

router.get('/me', requireAuth, isBanned, me)
router.patch(
    '/me',
    requireAuth,
    isBanned,
    profileUpdateRateLimiter,
    updateProfile
)
router.patch('/me/avatar', requireAuth, isBanned, updateAvatar)
router.post('/me/change-password', requireAuth, isBanned, changePassword)

export default router
