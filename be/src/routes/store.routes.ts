import { Router } from 'express'
import {
  createStockMovement,
  createStoreItem,
  deleteStoreItem,
  getLowStockItems,
  getStockMovements,
  getStoreItems,
  getStoreOverview,
  updateStoreItem,
} from '../controllers/store.controller.js'

const router = Router()

router.get('/overview', getStoreOverview)
router.get('/items', getStoreItems)
router.get('/items/low-stock', getLowStockItems)
router.post('/items', createStoreItem)
router.patch('/items/:id', updateStoreItem)
router.delete('/items/:id', deleteStoreItem)
router.get('/movements', getStockMovements)
router.post('/movements', createStockMovement)

export default router
