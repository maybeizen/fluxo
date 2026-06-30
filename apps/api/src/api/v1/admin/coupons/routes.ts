import { Router, type Router as RouterType } from 'express'
import { getAllCoupons, getCouponById, getCouponByCode } from './get'
import { createCoupon } from './create'
import { updateCoupon } from './update'
import { deleteCoupon } from './delete'
import { getCouponStats } from './stats'

const router: RouterType = Router()

router.get('/', getAllCoupons)
router.get('/id/:id', getCouponById)
router.get('/code/:code', getCouponByCode)
router.get('/:id/stats', getCouponStats)
router.post('/', createCoupon)
router.put('/:id', updateCoupon)
router.delete('/:id', deleteCoupon)

export default router
