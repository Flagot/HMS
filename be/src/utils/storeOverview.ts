import { StoreItem } from '../models/StoreItem.js'
import { StockMovement } from '../models/StockMovement.js'
import type { StoreCategory, StoreOverview } from '../types/store.js'
import { STORE_CATEGORIES } from '../types/store.js'
import { roundMoney } from './payment.js'
import { toStockMovementResponse, toStoreItemResponse } from './storeMapper.js'

function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
}

export async function buildStoreOverview(): Promise<StoreOverview> {
  const items = await StoreItem.find().sort({ name: 1 })
  const mapped = items.map(toStoreItemResponse)
  const lowStockItems = mapped.filter((item) => item.isLowStock).slice(0, 8)
  const totalStockValue = roundMoney(
    mapped.reduce((sum, item) => sum + item.stockValue, 0),
  )

  const categoryMap = new Map<StoreCategory, number>(
    STORE_CATEGORIES.map((category) => [category, 0]),
  )
  for (const item of mapped) {
    categoryMap.set(item.category, (categoryMap.get(item.category) ?? 0) + 1)
  }

  const dayStart = startOfUtcDay()
  const todayMovements = await StockMovement.find({
    createdAt: { $gte: dayStart },
  }).lean()

  let receivedToday = 0
  let issuedToday = 0
  for (const movement of todayMovements) {
    if (movement.type === 'receive') receivedToday += movement.quantity
    if (movement.type === 'issue') issuedToday += Math.abs(movement.quantity)
  }

  const recentDocs = await StockMovement.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('item')

  return {
    totalItems: mapped.length,
    lowStockCount: mapped.filter((item) => item.isLowStock).length,
    totalStockValue,
    movementsToday: todayMovements.length,
    receivedToday,
    issuedToday,
    categoryCounts: STORE_CATEGORIES.map((category) => ({
      category,
      count: categoryMap.get(category) ?? 0,
    })).filter((row) => row.count > 0),
    recentMovements: recentDocs.map(toStockMovementResponse),
    lowStockItems,
  }
}
