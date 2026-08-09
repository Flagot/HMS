import { Router } from 'express'
import {
  getKitchenMenu,
  getKitchenOrders,
  updateKitchenOrderStatus,
  updateMenuAvailability,
} from '../controllers/kitchen.controller.js'

const router = Router()

router.get('/menu', getKitchenMenu)
router.patch('/menu/:id/availability', updateMenuAvailability)
router.get('/orders', getKitchenOrders)
router.patch('/orders/:id/status', updateKitchenOrderStatus)

export default router
