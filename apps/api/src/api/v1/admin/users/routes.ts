import { Router, type Router as RouterType } from 'express'
import {
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUserByUsername,
} from './get'
import { createUser } from './create'
import { updateUser } from './update'
import { deleteUser } from './delete'
import { banUser } from './ban'
import { unbanUser } from './unban'
import { ticketBanUser } from './ticket-ban'
import { ticketUnbanUser } from './ticket-unban'

const router: RouterType = Router()

router.get('/', getAllUsers)
router.get('/id/:id', getUserById)
router.get('/email/:email', getUserByEmail)
router.get('/username/:username', getUserByUsername)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.post('/:id/ban', banUser)
router.post('/:id/unban', unbanUser)
router.post('/:id/ticket-ban', ticketBanUser)
router.post('/:id/ticket-unban', ticketUnbanUser)

export default router
