import { Router } from 'express'
import {
  getKitchenMenu,
  updateMenuAvailability,
} from '../controllers/kitchen.controller.js'

const router = Router()

router.get('/menu', getKitchenMenu)
router.patch('/menu/:id/availability', updateMenuAvailability)

export default router
