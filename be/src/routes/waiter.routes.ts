import { Router } from 'express'
import {
  createOrder,
  getMenu,
  getOrders,
  updateOrderItems,
  updateOrderPayment,
  updateOrderStatus,
} from '../controllers/waiter.controller.js'

const router = Router()

router.get('/menu', getMenu)
router.get('/orders', getOrders)
router.post('/orders', createOrder)
router.patch('/orders/:id/items', updateOrderItems)
router.patch('/orders/:id/status', updateOrderStatus)
router.patch('/orders/:id/payment', updateOrderPayment)

export default router
