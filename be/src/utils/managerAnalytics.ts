import { Expense } from '../models/Expense.js'
import { Order } from '../models/Order.js'
import { Reservation } from '../models/Reservation.js'
import type { ExpenseCategory } from '../types/expense.js'
import type {
  AnalyticsSeriesPoint,
  CategoryTotal,
  FoodItemTotal,
  ManagerAnalyticsResponse,
  ManagerFnbDetailResponse,
  ManagerFnbSnapshot,
  ManagerIncomeDetailResponse,
  ManagerPeriod,
  ManagerRoomSnapshot,
  StayIncomeRow,
} from '../types/manager.js'
import type { ReceptionRoomResponse } from '../types/reservation.js'
import { toExpenseResponse } from './expenseMapper.js'
import {
  derivePaymentStatus,
  roundMoney,
  staysIncludeDate,
} from './payment.js'
import { toReservationResponse } from './reservationMapper.js'
import {
  buildStayIncomeSummary,
  loadRoomsWithOccupancy,
} from './managerOverview.js'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  payroll: 'Payroll',
  fnb_supplies: 'F&B supplies',
  housekeeping: 'Housekeeping',
  utilities: 'Utilities',
  maintenance: 'Maintenance',
  amenities: 'Amenities',
  marketing: 'Marketing',
  other: 'Other',
}

export function startOfUtcDay(day: Date): Date {
  return new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0, 0),
  )
}

export function endOfUtcDay(day: Date): Date {
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  )
}

function addUtcDays(day: Date, days: number): Date {
  const next = new Date(day)
  next.setUTCDate(next.getUTCDate() + days)
  return startOfUtcDay(next)
}

function dateKey(day: Date): string {
  return day.toISOString().slice(0, 10)
}

/** Monday-start ISO week containing the anchor day. */
function startOfUtcWeek(day: Date): Date {
  const start = startOfUtcDay(day)
  const weekday = start.getUTCDay() // 0 Sun … 6 Sat
  const offset = weekday === 0 ? -6 : 1 - weekday
  return addUtcDays(start, offset)
}

function startOfUtcMonth(day: Date): Date {
  return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1, 0, 0, 0, 0))
}

function endOfUtcMonth(day: Date): Date {
  return endOfUtcDay(
    new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 0, 12, 0, 0, 0)),
  )
}

export function resolvePeriodRange(
  period: ManagerPeriod,
  anchor: Date,
): { start: Date; end: Date } {
  const day = startOfUtcDay(anchor)
  if (period === 'day') {
    return { start: day, end: endOfUtcDay(day) }
  }
  if (period === 'week') {
    const start = startOfUtcWeek(day)
    return { start, end: endOfUtcDay(addUtcDays(start, 6)) }
  }
  const start = startOfUtcMonth(day)
  return { start, end: endOfUtcMonth(day) }
}

export function eachUtcDay(start: Date, end: Date): Date[] {
  const days: Date[] = []
  let cursor = startOfUtcDay(start)
  const last = startOfUtcDay(end)
  while (cursor.getTime() <= last.getTime()) {
    days.push(cursor)
    cursor = addUtcDays(cursor, 1)
  }
  return days
}

function nightsOverlap(
  checkIn: Date,
  checkOut: Date,
  rangeStart: Date,
  rangeEnd: Date,
): number {
  const stayStart = startOfUtcDay(checkIn).getTime()
  const stayEndExclusive = startOfUtcDay(checkOut).getTime()
  const rangeStartMs = startOfUtcDay(rangeStart).getTime()
  const rangeEndExclusive = addUtcDays(startOfUtcDay(rangeEnd), 1).getTime()

  const overlapStart = Math.max(stayStart, rangeStartMs)
  const overlapEnd = Math.min(stayEndExclusive, rangeEndExclusive)
  if (overlapEnd <= overlapStart) return 0
  return Math.round((overlapEnd - overlapStart) / (24 * 60 * 60 * 1000))
}

function summarizeRooms(rooms: ReceptionRoomResponse[]): ManagerRoomSnapshot {
  const snapshot: ManagerRoomSnapshot = {
    total: rooms.length,
    vacant: 0,
    reserved: 0,
    occupied: 0,
    housekeeping: {
      dirty: 0,
      in_progress: 0,
      clean: 0,
      inspect: 0,
    },
  }
  for (const room of rooms) {
    snapshot[room.occupancy] += 1
    snapshot.housekeeping[room.housekeepingStatus] += 1
  }
  return snapshot
}

export function summarizeFnb(
  orders: Array<{
    type: 'table' | 'room_service'
    status: 'pending' | 'preparing' | 'ready' | 'served'
    paymentStatus?: 'unpaid' | 'paid'
    total: number
  }>,
): ManagerFnbSnapshot {
  const snapshot: ManagerFnbSnapshot = {
    orderCount: orders.length,
    servedCount: 0,
    paidCount: 0,
    unpaidCount: 0,
    revenueTotal: 0,
    billedTotal: 0,
    unpaidTotal: 0,
    byType: { table: 0, room_service: 0 },
    byStatus: { pending: 0, preparing: 0, ready: 0, served: 0 },
  }
  for (const order of orders) {
    snapshot.byType[order.type] += 1
    snapshot.byStatus[order.status] += 1
    if (order.status === 'served') snapshot.servedCount += 1
    const total = roundMoney(order.total ?? 0)
    snapshot.billedTotal += total
    if (order.paymentStatus === 'paid') {
      snapshot.paidCount += 1
      snapshot.revenueTotal += total
    } else {
      snapshot.unpaidCount += 1
      snapshot.unpaidTotal += total
    }
  }
  snapshot.revenueTotal = roundMoney(snapshot.revenueTotal)
  snapshot.billedTotal = roundMoney(snapshot.billedTotal)
  snapshot.unpaidTotal = roundMoney(snapshot.unpaidTotal)
  return snapshot
}

function isPaid(order: { paymentStatus?: 'unpaid' | 'paid' }): boolean {
  return order.paymentStatus === 'paid'
}

function aggregateFoodItems(
  orders: Array<{
    items: Array<{
      menuItemId: string
      name: string
      quantity: number
      lineTotal: number
    }>
  }>,
): FoodItemTotal[] {
  const map = new Map<string, FoodItemTotal>()
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const existing = map.get(item.menuItemId)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue = roundMoney(existing.revenue + item.lineTotal)
      } else {
        map.set(item.menuItemId, {
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          revenue: roundMoney(item.lineTotal),
        })
      }
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue)
}

export async function buildManagerAnalytics(
  period: ManagerPeriod,
  anchor: Date,
): Promise<ManagerAnalyticsResponse> {
  const { start, end } = resolvePeriodRange(period, anchor)
  const days = eachUtcDay(start, end)

  const [reservations, orders, expenses, roomList] = await Promise.all([
    Reservation.find({ status: { $ne: 'cancelled' } }),
    Order.find({
      createdAt: { $gte: start, $lte: end },
    }),
    Expense.find({
      spentOn: { $gte: start, $lte: end },
    }),
    loadRoomsWithOccupancy(),
  ])

  const roomIncomeByDay = new Map<string, number>()
  const fnbIncomeByDay = new Map<string, number>()
  const expenseByDay = new Map<string, number>()
  for (const day of days) {
    const key = dateKey(day)
    roomIncomeByDay.set(key, 0)
    fnbIncomeByDay.set(key, 0)
    expenseByDay.set(key, 0)
  }

  let roomsAccrued = 0
  let roomsCollected = 0
  const overlappingIds = new Set<string>()

  for (const reservation of reservations) {
    const nightsInPeriod = nightsOverlap(
      reservation.checkInDate,
      reservation.checkOutDate,
      start,
      end,
    )
    if (nightsInPeriod > 0) {
      overlappingIds.add(reservation._id.toString())
      const accrued = roundMoney(
        (reservation.ratePerNight ?? 0) * nightsInPeriod,
      )
      roomsAccrued += accrued
      roomsCollected += roundMoney(reservation.amountPaid ?? 0)

      for (const day of days) {
        if (
          staysIncludeDate(reservation.checkInDate, reservation.checkOutDate, day)
        ) {
          const key = dateKey(day)
          roomIncomeByDay.set(
            key,
            roundMoney(
              (roomIncomeByDay.get(key) ?? 0) + (reservation.ratePerNight ?? 0),
            ),
          )
        }
      }
    }
  }
  roomsAccrued = roundMoney(roomsAccrued)
  roomsCollected = roundMoney(roomsCollected)

  // Only paid orders count as F&B income.
  for (const order of orders) {
    if (!isPaid(order)) continue
    const key = dateKey(order.createdAt)
    if (fnbIncomeByDay.has(key)) {
      fnbIncomeByDay.set(
        key,
        roundMoney((fnbIncomeByDay.get(key) ?? 0) + (order.total ?? 0)),
      )
    }
  }

  for (const expense of expenses) {
    const key = dateKey(expense.spentOn)
    if (expenseByDay.has(key)) {
      expenseByDay.set(
        key,
        roundMoney((expenseByDay.get(key) ?? 0) + (expense.amount ?? 0)),
      )
    }
  }

  const paidOrders = orders.filter(isPaid)
  const fnbRevenue = roundMoney(
    paidOrders.reduce((sum, order) => sum + (order.total ?? 0), 0),
  )
  const expenseTotal = roundMoney(
    expenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0),
  )
  const incomeTotal = roundMoney(roomsAccrued + fnbRevenue)

  const categoryMap = new Map<ExpenseCategory, CategoryTotal>()
  for (const expense of expenses) {
    const existing = categoryMap.get(expense.category)
    if (existing) {
      existing.total = roundMoney(existing.total + expense.amount)
      existing.count += 1
    } else {
      categoryMap.set(expense.category, {
        category: expense.category,
        label: CATEGORY_LABELS[expense.category],
        total: roundMoney(expense.amount),
        count: 1,
      })
    }
  }

  const series: AnalyticsSeriesPoint[] = days.map((day) => {
    const key = dateKey(day)
    const roomIncome = roomIncomeByDay.get(key) ?? 0
    const fnbIncome = fnbIncomeByDay.get(key) ?? 0
    const dayExpenses = expenseByDay.get(key) ?? 0
    const totalIncome = roundMoney(roomIncome + fnbIncome)
    return {
      date: key,
      roomIncome,
      fnbIncome,
      expenses: dayExpenses,
      totalIncome,
      net: roundMoney(totalIncome - dayExpenses),
    }
  })

  return {
    period,
    startDate: dateKey(start),
    endDate: dateKey(end),
    income: {
      total: incomeTotal,
      roomsAccrued,
      roomsCollected,
      reservationCount: overlappingIds.size,
      fnbRevenue,
      orderCount: orders.length,
    },
    expenses: {
      total: expenseTotal,
      count: expenses.length,
      byCategory: [...categoryMap.values()].sort((a, b) => b.total - a.total),
    },
    net: roundMoney(incomeTotal - expenseTotal),
    series,
    incomeBySource: [
      { key: 'rooms', label: 'Room stays', value: roomsAccrued },
      { key: 'fnb', label: 'Food & beverage', value: fnbRevenue },
    ],
    topFoodItems: aggregateFoodItems(paidOrders).slice(0, 8),
    rooms: summarizeRooms(roomList),
  }
}

export async function buildIncomeDetail(
  period: ManagerPeriod,
  anchor: Date,
): Promise<ManagerIncomeDetailResponse> {
  const { start, end } = resolvePeriodRange(period, anchor)
  const [reservations, orders, roomDocs] = await Promise.all([
    Reservation.find({ status: { $ne: 'cancelled' } }).sort({ checkInDate: 1 }),
    Order.find({ createdAt: { $gte: start, $lte: end } }),
    loadRoomsWithOccupancy(),
  ])

  const roomNumberById = new Map(roomDocs.map((room) => [room.id, room.number]))

  const stays: StayIncomeRow[] = []
  let roomsAccrued = 0
  let roomsCollected = 0

  for (const reservation of reservations) {
    const nightsInPeriod = nightsOverlap(
      reservation.checkInDate,
      reservation.checkOutDate,
      start,
      end,
    )
    if (nightsInPeriod <= 0) continue

    const accruedInPeriod = roundMoney(
      (reservation.ratePerNight ?? 0) * nightsInPeriod,
    )
    roomsAccrued += accruedInPeriod
    roomsCollected += roundMoney(reservation.amountPaid ?? 0)

    const mapped = toReservationResponse(
      reservation,
      null,
    )

    stays.push({
      id: mapped.id,
      confirmationCode: mapped.confirmationCode,
      guestName: mapped.guestName,
      roomNumber: reservation.roomId
        ? roomNumberById.get(reservation.roomId.toString())
        : undefined,
      roomType: mapped.roomType,
      checkInDate: mapped.checkInDate,
      checkOutDate: mapped.checkOutDate,
      nights: mapped.nights,
      nightsInPeriod,
      accruedInPeriod,
      totalAmount: mapped.totalAmount,
      amountPaid: mapped.amountPaid,
      balanceDue: mapped.balanceDue,
      paymentStatus: mapped.paymentStatus,
      status: mapped.status,
    })
  }

  const paidOrders = orders.filter(isPaid)
  const fnbRevenue = roundMoney(
    paidOrders.reduce((sum, order) => sum + (order.total ?? 0), 0),
  )

  return {
    period,
    startDate: dateKey(start),
    endDate: dateKey(end),
    totals: {
      roomsAccrued: roundMoney(roomsAccrued),
      roomsCollected: roundMoney(roomsCollected),
      fnbRevenue,
      totalIncome: roundMoney(roomsAccrued + fnbRevenue),
    },
    stays,
    foodItems: aggregateFoodItems(paidOrders),
  }
}

export async function buildFnbDetail(
  period: ManagerPeriod,
  anchor: Date,
): Promise<ManagerFnbDetailResponse> {
  const { start, end } = resolvePeriodRange(period, anchor)
  const orders = await Order.find({
    createdAt: { $gte: start, $lte: end },
  }).sort({ createdAt: -1 })

  return {
    period,
    startDate: dateKey(start),
    endDate: dateKey(end),
    summary: summarizeFnb(orders),
    foodItems: aggregateFoodItems(orders.filter(isPaid)),
  }
}

export async function listExpensesInPeriod(
  period: ManagerPeriod,
  anchor: Date,
) {
  const { start, end } = resolvePeriodRange(period, anchor)
  const expenses = await Expense.find({
    spentOn: { $gte: start, $lte: end },
  }).sort({ spentOn: -1 })

  return {
    period,
    startDate: dateKey(start),
    endDate: dateKey(end),
    total: roundMoney(
      expenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0),
    ),
    expenses: expenses.map(toExpenseResponse),
  }
}

export { CATEGORY_LABELS }
