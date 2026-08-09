import { Router } from 'express'
import {
  createAdminMenuItem,
  createAdminRoom,
  deleteAdminMenuItem,
  deleteAdminRoom,
  getAdminAnalytics,
  getAdminMenu,
  getAdminOverview,
  getAdminRooms,
  getAdminSettings,
  updateAdminMenuItem,
  updateAdminRoom,
  updateAdminSettings,
} from '../controllers/admin.controller.js'

const router = Router()

router.get('/overview', getAdminOverview)
router.get('/analytics', getAdminAnalytics)
router.get('/settings', getAdminSettings)
router.patch('/settings', updateAdminSettings)

router.get('/rooms', getAdminRooms)
router.post('/rooms', createAdminRoom)
router.patch('/rooms/:id', updateAdminRoom)
router.delete('/rooms/:id', deleteAdminRoom)

router.get('/menu', getAdminMenu)
router.post('/menu', createAdminMenuItem)
router.patch('/menu/:id', updateAdminMenuItem)
router.delete('/menu/:id', deleteAdminMenuItem)

export default router
