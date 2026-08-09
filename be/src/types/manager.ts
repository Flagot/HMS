import type { ExpenseCategory, ExpenseResponse } from './expense.js'
import type { IncomeSummaryResponse, ReceptionRoomResponse } from './reservation.js'

export type ManagerPeriod = 'day' | 'week' | 'month'

export type ManagerRoomSnapshot = {
  total: number
  vacant: number
  reserved: number
  occupied: number
  housekeeping: {
    dirty: number
    in_progress: number
    clean: number
    inspect: number
  }
}

export type ManagerFnbSnapshot = {
  orderCount: number
  servedCount: number
  paidCount: number
  unpaidCount: number
  /** Collected revenue — paid orders only. */
  revenueTotal: number
  /** Total value of all orders, paid or not. */
  billedTotal: number
  /** Value of orders not yet paid. */
  unpaidTotal: number
  byType: {
    table: number
    room_service: number
  }
  byStatus: {
    pending: number
    preparing: number
    ready: number
    served: number
  }
}

export type ManagerOverviewResponse = {
  date: string
  rooms: ManagerRoomSnapshot
  stays: IncomeSummaryResponse
  fnb: ManagerFnbSnapshot
  combinedRevenue: number
}

export type AnalyticsSeriesPoint = {
  date: string
  roomIncome: number
  fnbIncome: number
  expenses: number
  totalIncome: number
  net: number
}

export type CategoryTotal = {
  category: ExpenseCategory
  label: string
  total: number
  count: number
}

export type FoodItemTotal = {
  menuItemId: string
  name: string
  quantity: number
  revenue: number
}

export type IncomeSourceSlice = {
  key: 'rooms' | 'fnb'
  label: string
  value: number
}

export type ManagerAnalyticsResponse = {
  period: ManagerPeriod
  startDate: string
  endDate: string
  income: {
    total: number
    roomsAccrued: number
    roomsCollected: number
    reservationCount: number
    fnbRevenue: number
    orderCount: number
  }
  expenses: {
    total: number
    count: number
    byCategory: CategoryTotal[]
  }
  net: number
  series: AnalyticsSeriesPoint[]
  incomeBySource: IncomeSourceSlice[]
  topFoodItems: FoodItemTotal[]
  rooms: ManagerRoomSnapshot
}

export type StayIncomeRow = {
  id: string
  confirmationCode: string
  guestName: string
  roomNumber?: string
  roomType: string
  checkInDate: string
  checkOutDate: string
  nights: number
  nightsInPeriod: number
  accruedInPeriod: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  paymentStatus: string
  status: string
}

export type ManagerIncomeDetailResponse = {
  period: ManagerPeriod
  startDate: string
  endDate: string
  totals: {
    roomsAccrued: number
    roomsCollected: number
    fnbRevenue: number
    totalIncome: number
  }
  stays: StayIncomeRow[]
  foodItems: FoodItemTotal[]
}

export type ManagerFnbDetailResponse = {
  period: ManagerPeriod
  startDate: string
  endDate: string
  summary: ManagerFnbSnapshot
  foodItems: FoodItemTotal[]
}

export type { ExpenseResponse, ReceptionRoomResponse }
