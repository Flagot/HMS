import { Router } from 'express'
import {
  assignRoom,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  createReservation,
  getIncomeSummary,
  getReceptionRooms,
  getReservations,
  updatePayment,
} from '../controllers/reception.controller.js'

const router = Router()

router.get('/reservations', getReservations)
router.post('/reservations', createReservation)
router.patch('/reservations/:id/assign-room', assignRoom)
router.patch('/reservations/:id/payment', updatePayment)
router.post('/reservations/:id/check-in', checkInReservation)
router.post('/reservations/:id/check-out', checkOutReservation)
router.post('/reservations/:id/cancel', cancelReservation)
router.get('/rooms', getReceptionRooms)
router.get('/income', getIncomeSummary)

export default router
