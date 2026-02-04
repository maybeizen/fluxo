import { Router, type Router as RouterType } from 'express'
import { register } from './register'
import { login } from './login'
import { me } from './me'
import { requireAuth } from '../../../middleware/requireAuth'
import { logout } from './logout'
import { resetPassword } from './reset-password'
import { verifyEmail } from './verify-email'
import { resendVerification } from './resend-verification'
import { emailRateLimiter } from '../../../middleware/rateLimiters'
import {
    authRateLimiter,
    meRateLimiter,
} from '../../../middleware/rateLimiters'

const router: RouterType = Router()

router.post('/login', authRateLimiter, login)
router.post('/register', authRateLimiter, emailRateLimiter, register)
router.post('/logout', requireAuth, logout)
router.post('/reset-password', authRateLimiter, resetPassword)
router.post(
    '/resend-verification',
    authRateLimiter,
    emailRateLimiter,
    resendVerification
)

router.get('/verify-email', verifyEmail)
router.get('/me', meRateLimiter, requireAuth, me)

export default router
