import { Router, type Router as RouterType } from 'express'
import { initiateDiscordOAuth } from './connect'
import { handleDiscordCallback } from './callback'
import { disconnectDiscord } from './disconnect'
import { requireAuth } from '../../../middleware/requireAuth'
import { isBanned } from '../../../middleware/isBanned'

const router: RouterType = Router()

router.get('/connect', requireAuth, isBanned, initiateDiscordOAuth)
router.get('/callback', handleDiscordCallback)
router.post('/disconnect', requireAuth, isBanned, disconnectDiscord)

export default router
