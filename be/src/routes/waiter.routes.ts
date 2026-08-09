import { Router } from 'express'
import {
  createOrder,
  getMenu,
  getOrders,
  updateOrderItems,
  updateOrderStatus,
} from '../controllers/waiter.controller.js'

const router = Router()

router.get('/menu', getMenu)
router.get('/orders', getOrders)
router.post('/orders', createOrder)
router.patch('/orders/:id/items', updateOrderItems)
router.patch('/orders/:id/status', updateOrderStatus)

export default router
