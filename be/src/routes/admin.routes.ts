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
import {
  dismissPasswordResetRequest,
  getPasswordResetPendingCount,
  listPasswordResetRequests,
  resolvePasswordResetRequest,
} from '../controllers/passwordReset.controller.js'
import {
  getAdminPayroll,
  getPayrollAlerts,
  markPayrollPaid,
  unmarkPayrollPaid,
  updatePayrollProfile,
} from '../controllers/payroll.controller.js'
import { updateStaffUser } from '../controllers/staffUsers.controller.js'

const router = Router()

router.patch('/users/:id', updateStaffUser)

router.get('/payroll', getAdminPayroll)
router.get('/payroll/alerts', getPayrollAlerts)
router.post('/payroll/:userId/pay', markPayrollPaid)
router.post('/payroll/:userId/unpay', unmarkPayrollPaid)
router.patch('/payroll/:userId/profile', updatePayrollProfile)

router.get('/overview', getAdminOverview)
router.get('/analytics', getAdminAnalytics)
router.get('/settings', getAdminSettings)
router.patch('/settings', updateAdminSettings)

router.get('/password-reset-requests', listPasswordResetRequests)
router.get('/password-reset-requests/pending-count', getPasswordResetPendingCount)
router.post('/password-reset-requests/:id/resolve', resolvePasswordResetRequest)
router.post('/password-reset-requests/:id/dismiss', dismissPasswordResetRequest)

router.get('/rooms', getAdminRooms)
router.post('/rooms', createAdminRoom)
router.patch('/rooms/:id', updateAdminRoom)
router.delete('/rooms/:id', deleteAdminRoom)

router.get('/menu', getAdminMenu)
router.post('/menu', createAdminMenuItem)
router.patch('/menu/:id', updateAdminMenuItem)
router.delete('/menu/:id', deleteAdminMenuItem)

export default router
