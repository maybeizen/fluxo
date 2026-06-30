import { Router, type Router as RouterType } from 'express'
import { requireAdmin } from '../../../../middleware/requireAdmin'
import { getAllTickets, getTicketById } from './get'
import { updateTicket } from './update'
import { deleteTicket } from './delete'
import { addMessage } from './add-message'
import { uploadAttachment } from './upload-attachment'

const router: RouterType = Router()

router.get('/', requireAdmin, getAllTickets)
router.get('/:id', requireAdmin, getTicketById)
router.patch('/:id', requireAdmin, updateTicket)
router.delete('/:id', requireAdmin, deleteTicket)
router.post('/:id/messages', requireAdmin, addMessage)
router.post('/:id/attachments', requireAdmin, uploadAttachment)

export default router
