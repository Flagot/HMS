import { Expense } from '../models/Expense.js'
import { Order } from '../models/Order.js'
import { Reservation } from '../models/Reservation.js'
import { Room } from '../models/Room.js'
import type {
  AdminAnalytics,
  AdminAnalyticsSeriesPoint,
  AdminNamedCount,
  AdminPeriod,
} from '../types/admin.js'
import { roundMoney, staysIncludeDate } from './payment.js'
import {
  eachUtcDay,
  resolvePeriodRange,
  startOfUtcDay,
} from './managerAnalytics.js'

function dateKey(day: Date): string {
  return day.toISOString().slice(0, 10)
}

function roomIncomeForDay(
  reservations: Array<{
    status: string
    checkInDate: Date
    checkOutDate: Date
    ratePerNight: number
  }>,
  day: Date,
): number {
  let total = 0
  for (const reservation of reservations) {
    if (reservation.status === 'cancelled') continue
    if (
      staysIncludeDate(
        reservation.checkInDate,
        reservation.checkOutDate,
        day,
      )
    ) {
      total += reservation.ratePerNight
    }
  }
  return roundMoney(total)
}

function occupiedCountForDay(
  reservations: Array<{
    status: string
    checkInDate: Date
    checkOutDate: Date
  }>,
  day: Date,
): number {
  let count = 0
  for (const reservation of reservations) {
    if (reservation.status === 'cancelled') continue
    if (
      staysIncludeDate(
        reservation.checkInDate,
        reservation.checkOutDate,
        day,
      )
    ) {
      count += 1
    }
  }
  return count
}

export async function buildAdminAnalytics(
  period: AdminPeriod,
  anchor: Date,
): Promise<AdminAnalytics> {
  const { start, end } = resolvePeriodRange(period, anchor)
  const days = eachUtcDay(start, end)

  const [reservations, orders, expenses, rooms] = await Promise.all([
    Reservation.find({ status: { $ne: 'cancelled' } }),
    Order.find({ createdAt: { $gte: start, $lte: end } }),
    Expense.find({ spentOn: { $gte: start, $lte: end } }),
    Room.find(),
  ])

  const roomTotal = Math.max(rooms.length, 1)
  const ordersByDay = new Map<string, { count: number; revenue: number }>()
  const expensesByDay = new Map<string, number>()
  const checkInsByDay = new Map<string, number>()
  const checkOutsByDay = new Map<string, number>()

  for (const day of days) {
    const key = dateKey(day)
    ordersByDay.set(key, { count: 0, revenue: 0 })
    expensesByDay.set(key, 0)
    checkInsByDay.set(key, 0)
    checkOutsByDay.set(key, 0)
  }

  // Only paid orders count toward F&B income.
  for (const order of orders) {
    const key = dateKey(startOfUtcDay(order.createdAt))
    const bucket = ordersByDay.get(key)
    if (!bucket) continue
    bucket.count += 1
    if (order.paymentStatus === 'paid') {
      bucket.revenue = roundMoney(bucket.revenue + (order.total ?? 0))
    }
  }

  for (const expense of expenses) {
    const key = dateKey(startOfUtcDay(expense.spentOn))
    if (!expensesByDay.has(key)) continue
    expensesByDay.set(
      key,
      roundMoney((expensesByDay.get(key) ?? 0) + expense.amount),
    )
  }

  for (const reservation of reservations) {
    const inKey = dateKey(startOfUtcDay(reservation.checkInDate))
    const outKey = dateKey(startOfUtcDay(reservation.checkOutDate))
    if (checkInsByDay.has(inKey)) {
      checkInsByDay.set(inKey, (checkInsByDay.get(inKey) ?? 0) + 1)
    }
    if (checkOutsByDay.has(outKey)) {
      checkOutsByDay.set(outKey, (checkOutsByDay.get(outKey) ?? 0) + 1)
    }
  }

  const series: AdminAnalyticsSeriesPoint[] = days.map((day) => {
    const key = dateKey(day)
    const roomIncome = roomIncomeForDay(reservations, day)
    const orderBucket = ordersByDay.get(key) ?? { count: 0, revenue: 0 }
    const expenseTotal = expensesByDay.get(key) ?? 0
    const occupiedRooms = occupiedCountForDay(reservations, day)
    const totalIncome = roundMoney(roomIncome + orderBucket.revenue)

    return {
      date: key,
      roomIncome,
      fnbIncome: orderBucket.revenue,
      totalIncome,
      expenses: expenseTotal,
      net: roundMoney(totalIncome - expenseTotal),
      occupiedRooms,
      occupancyRate: roundMoney(occupiedRooms / roomTotal),
      orders: orderBucket.count,
      checkIns: checkInsByDay.get(key) ?? 0,
      checkOuts: checkOutsByDay.get(key) ?? 0,
    }
  })

  const kpis = series.reduce(
    (acc, point) => {
      acc.totalIncome = roundMoney(acc.totalIncome + point.totalIncome)
      acc.totalExpenses = roundMoney(acc.totalExpenses + point.expenses)
      acc.roomIncome = roundMoney(acc.roomIncome + point.roomIncome)
      acc.fnbIncome = roundMoney(acc.fnbIncome + point.fnbIncome)
      acc.orderCount += point.orders
      acc.checkInCount += point.checkIns
      acc.checkOutCount += point.checkOuts
      acc.occupancySum += point.occupancyRate
      return acc
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      roomIncome: 0,
      fnbIncome: 0,
      orderCount: 0,
      checkInCount: 0,
      checkOutCount: 0,
      occupancySum: 0,
    },
  )

  const typeMap = new Map<string, number>()
  const statusMap = new Map<string, number>()
  for (const room of rooms) {
    typeMap.set(room.type, (typeMap.get(room.type) ?? 0) + 1)
    statusMap.set(room.status, (statusMap.get(room.status) ?? 0) + 1)
  }

  const orderStatusMap = new Map<string, number>()
  for (const order of orders) {
    orderStatusMap.set(
      order.status,
      (orderStatusMap.get(order.status) ?? 0) + 1,
    )
  }

  const foodMap = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >()
  for (const order of orders) {
    if (order.paymentStatus !== 'paid') continue
    for (const item of order.items ?? []) {
      const existing = foodMap.get(item.menuItemId)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue = roundMoney(existing.revenue + item.lineTotal)
      } else {
        foodMap.set(item.menuItemId, {
          name: item.name,
          quantity: item.quantity,
          revenue: roundMoney(item.lineTotal),
        })
      }
    }
  }

  const typeLabels: Record<string, string> = {
    standard: 'Standard',
    deluxe: 'Deluxe',
    suite: 'Suite',
  }
  const statusLabels: Record<string, string> = {
    dirty: 'Dirty',
    in_progress: 'In progress',
    clean: 'Clean',
    inspect: 'Inspect',
  }
  const orderLabels: Record<string, string> = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
  }

  const roomsByType: AdminNamedCount[] = [...typeMap.entries()].map(
    ([key, value]) => ({
      key,
      label: typeLabels[key] ?? key,
      value,
    }),
  )
  const roomsByStatus: AdminNamedCount[] = [...statusMap.entries()].map(
    ([key, value]) => ({
      key,
      label: statusLabels[key] ?? key,
      value,
    }),
  )
  const ordersByStatus: AdminNamedCount[] = [...orderStatusMap.entries()].map(
    ([key, value]) => ({
      key,
      label: orderLabels[key] ?? key,
      value,
    }),
  )

  return {
    period,
    startDate: dateKey(start),
    endDate: dateKey(end),
    kpis: {
      totalIncome: kpis.totalIncome,
      totalExpenses: kpis.totalExpenses,
      net: roundMoney(kpis.totalIncome - kpis.totalExpenses),
      avgOccupancyRate: roundMoney(kpis.occupancySum / Math.max(days.length, 1)),
      orderCount: kpis.orderCount,
      checkInCount: kpis.checkInCount,
      checkOutCount: kpis.checkOutCount,
      roomIncome: kpis.roomIncome,
      fnbIncome: kpis.fnbIncome,
    },
    series,
    roomsByType,
    roomsByStatus,
    ordersByStatus,
    revenueBySource: [
      { key: 'rooms', label: 'Rooms', value: kpis.roomIncome },
      { key: 'fnb', label: 'F&B', value: kpis.fnbIncome },
    ],
    topFoodItems: [...foodMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
  }
}
