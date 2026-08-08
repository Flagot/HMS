import { Router } from 'express'
import { getRooms, updateRoomStatus } from '../controllers/housekeeping.controller.js'

const router = Router()

router.get('/rooms', getRooms)
router.patch('/rooms/:id/status', updateRoomStatus)

export default router
