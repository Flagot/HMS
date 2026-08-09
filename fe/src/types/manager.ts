import type { IncomeSummary, ReceptionRoom } from './reservation'

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
  revenueTotal: number
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

export type ManagerOverview = {
  date: string
  rooms: ManagerRoomSnapshot
  stays: IncomeSummary
  fnb: ManagerFnbSnapshot
  combinedRevenue: number
}

export type ManagerRoom = ReceptionRoom

export type ExpenseCategory =
  | 'payroll'
  | 'fnb_supplies'
  | 'housekeeping'
  | 'utilities'
  | 'maintenance'
  | 'amenities'
  | 'marketing'
  | 'other'

export type Expense = {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  spentOn: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type CreateExpenseInput = {
  title: string
  category: ExpenseCategory
  amount: number
  spentOn: string
  note?: string
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

export type ManagerAnalytics = {
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

export type ManagerIncomeDetail = {
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

export type ManagerFnbDetail = {
  period: ManagerPeriod
  startDate: string
  endDate: string
  summary: ManagerFnbSnapshot
  foodItems: FoodItemTotal[]
}

export type ManagerExpensesResult = {
  period: ManagerPeriod
  startDate: string
  endDate: string
  total: number
  expenses: Expense[]
}

export const EXPENSE_CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'payroll', label: 'Payroll' },
  { value: 'fnb_supplies', label: 'F&B supplies' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
]
