import { Router, type Router as RouterType } from 'express'
import { requireAuth } from '../../../../middleware/requireAuth'
import { isTicketBanned } from '../../../../middleware/isTicketBanned'
import { createTicket } from './create'
import { getMyTickets, getMyTicketById } from './get'
import { addMessage } from './add-message'
import { uploadAttachment } from './upload-attachment'

const router: RouterType = Router()

router.post('/', requireAuth, isTicketBanned, createTicket)
router.get('/', requireAuth, getMyTickets)
router.get('/:id', requireAuth, getMyTicketById)
router.post('/:id/messages', requireAuth, isTicketBanned, addMessage)
router.post('/:id/attachments', requireAuth, isTicketBanned, uploadAttachment)

export default router
