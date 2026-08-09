import { Expense } from '../models/Expense.js'
import { HotelSettings } from '../models/HotelSettings.js'
import { MenuItem } from '../models/MenuItem.js'
import { Order } from '../models/Order.js'
import { Reservation } from '../models/Reservation.js'
import { Room } from '../models/Room.js'
import { StoreItem } from '../models/StoreItem.js'
import type { AdminOverview, AdminSettings } from '../types/admin.js'
import { getServiceChargeRate, getTaxRate, roundMoney } from './pricing.js'
import { ensureMenuSeeded } from '../services/menuService.js'

export async function buildAdminOverview(): Promise<AdminOverview> {
  await ensureMenuSeeded()

  const [
    rooms,
    reservations,
    orders,
    menuItems,
    expenses,
    storeItems,
  ] = await Promise.all([
    Room.find().lean(),
    Reservation.find().lean(),
    Order.find().lean(),
    MenuItem.find().lean(),
    Expense.find().lean(),
    StoreItem.find().lean(),
  ])

  const byTypeMap = new Map<string, number>()
  const byStatusMap = new Map<string, number>()
  for (const room of rooms) {
    byTypeMap.set(room.type, (byTypeMap.get(room.type) ?? 0) + 1)
    byStatusMap.set(room.status, (byStatusMap.get(room.status) ?? 0) + 1)
  }

  const resCounts = {
    reserved: 0,
    checkedIn: 0,
    checkedOut: 0,
    cancelled: 0,
  }
  for (const reservation of reservations) {
    if (reservation.status === 'reserved') resCounts.reserved += 1
    else if (reservation.status === 'checked_in') resCounts.checkedIn += 1
    else if (reservation.status === 'checked_out') resCounts.checkedOut += 1
    else if (reservation.status === 'cancelled') resCounts.cancelled += 1
  }

  const orderCounts = {
    pending: 0,
    preparing: 0,
    ready: 0,
    served: 0,
  }
  for (const order of orders) {
    if (order.status in orderCounts) {
      orderCounts[order.status as keyof typeof orderCounts] += 1
    }
  }

  const available = menuItems.filter((item) => item.available).length
  const expenseTotal = roundMoney(
    expenses.reduce((sum, expense) => sum + expense.amount, 0),
  )
  const lowStockCount = storeItems.filter(
    (item) => item.quantityOnHand <= item.reorderLevel,
  ).length
  const storeValue = roundMoney(
    storeItems.reduce(
      (sum, item) => sum + item.quantityOnHand * item.unitCost,
      0,
    ),
  )

  return {
    rooms: {
      total: rooms.length,
      byType: [...byTypeMap.entries()].map(([type, count]) => ({ type, count })),
      byStatus: [...byStatusMap.entries()].map(([status, count]) => ({
        status,
        count,
      })),
    },
    reservations: {
      total: reservations.length,
      ...resCounts,
    },
    orders: {
      total: orders.length,
      ...orderCounts,
    },
    menu: {
      total: menuItems.length,
      available,
      unavailable: menuItems.length - available,
    },
    expenses: {
      count: expenses.length,
      totalAmount: expenseTotal,
    },
    store: {
      totalItems: storeItems.length,
      lowStockCount,
      totalStockValue: storeValue,
    },
  }
}

export async function getOrCreateHotelSettings() {
  let settings = await HotelSettings.findOne()
  if (!settings) {
    settings = await HotelSettings.create({ hotelName: 'GrandStay' })
  }
  return settings
}

export async function buildAdminSettings(): Promise<AdminSettings> {
  const settings = await getOrCreateHotelSettings()
  const taxRate = getTaxRate()
  const serviceChargeRate = getServiceChargeRate()

  return {
    hotelName: settings.hotelName,
    currency: 'ETB',
    taxRate,
    serviceChargeRate,
    taxRatePercent: roundMoney(taxRate * 100),
    serviceChargePercent: roundMoney(serviceChargeRate * 100),
    note: 'Tax and service charge rates are configured in the server environment (.env).',
  }
}
