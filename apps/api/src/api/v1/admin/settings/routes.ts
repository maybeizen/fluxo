import { Router, type Router as RouterType } from 'express'
import { getSettings } from './get'
import { updateSettings } from './update'
import { sendTestEmail } from './test-email'
import { uploadLogoHandler } from './upload-logo'

const router: RouterType = Router()

router.get('/', getSettings)
router.patch('/', updateSettings)
router.post('/test-email', sendTestEmail)
router.post('/logo', uploadLogoHandler)

export default router
