import { Router } from 'express'
import {
  createManagerExpense,
  deleteManagerExpense,
  getManagerAnalytics,
  getManagerExpenses,
  getManagerFnb,
  getManagerIncome,
  getManagerOverview,
  getManagerRooms,
} from '../controllers/manager.controller.js'

const router = Router()

router.get('/overview', getManagerOverview)
router.get('/rooms', getManagerRooms)
router.get('/analytics', getManagerAnalytics)
router.get('/income', getManagerIncome)
router.get('/fnb', getManagerFnb)
router.get('/expenses', getManagerExpenses)
router.post('/expenses', createManagerExpense)
router.delete('/expenses/:id', deleteManagerExpense)

export default router
