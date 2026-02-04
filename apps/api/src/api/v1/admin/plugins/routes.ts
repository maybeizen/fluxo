import { Router, type Router as RouterType } from 'express'
import { listPlugins } from './list'
import { getPluginById } from './get'
import { enablePlugin } from './enable'
import { disablePlugin } from './disable'
import { getPluginConfig, updatePluginConfig } from './config'
import { getPluginFieldOptions } from './field-options'
import { getPluginIssues } from './issues'
import { reloadPlugin } from './reload'

const router: RouterType = Router()

router.get('/', listPlugins)
router.get('/:id', getPluginById)
router.get('/:id/field-options/:fieldKey', getPluginFieldOptions)
router.get('/:id/issues', getPluginIssues)
router.post('/:id/reload', reloadPlugin)
router.post('/:id/enable', enablePlugin)
router.post('/:id/disable', disablePlugin)
router.get('/:id/config', getPluginConfig)
router.patch('/:id/config', updatePluginConfig)

export default router
