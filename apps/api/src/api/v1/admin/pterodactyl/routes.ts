import { Router, type Router as RouterType } from 'express'
import { getPterodactylSettings } from './get'
import { updatePterodactylSettings } from './update'
import { testPterodactylCredentials } from './test-credentials'
import { getNodes } from './get-nodes'
import { getUsers } from './get-users'
import { getServers } from './get-servers'
import { getLocations } from './get-locations'
import { getNests } from './get-nests'
import { getEggs } from './get-eggs'
import { refreshPterodactylData } from './refresh'

const router: RouterType = Router()

router.get('/', getPterodactylSettings)
router.patch('/', updatePterodactylSettings)
router.post('/test-credentials', testPterodactylCredentials)
router.get('/nodes', getNodes)
router.get('/users', getUsers)
router.get('/servers', getServers)
router.get('/locations', getLocations)
router.get('/nests', getNests)
router.get('/eggs', getEggs)
router.post('/refresh', refreshPterodactylData)

export default router
