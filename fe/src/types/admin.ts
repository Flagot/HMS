export type AdminOverview = {
  rooms: {
    total: number
    byType: { type: string; count: number }[]
    byStatus: { status: string; count: number }[]
  }
  reservations: {
    total: number
    reserved: number
    checkedIn: number
    checkedOut: number
    cancelled: number
  }
  orders: {
    total: number
    pending: number
    preparing: number
    ready: number
    served: number
  }
  menu: {
    total: number
    available: number
    unavailable: number
  }
  expenses: {
    count: number
    totalAmount: number
  }
  store: {
    totalItems: number
    lowStockCount: number
    totalStockValue: number
  }
}

export type AdminPeriod = 'day' | 'week' | 'month'

export type AdminAnalyticsSeriesPoint = {
  date: string
  roomIncome: number
  fnbIncome: number
  totalIncome: number
  expenses: number
  net: number
  occupiedRooms: number
  occupancyRate: number
  orders: number
  checkIns: number
  checkOuts: number
}

export type AdminNamedCount = {
  key: string
  label: string
  value: number
}

export type AdminAnalytics = {
  period: AdminPeriod
  startDate: string
  endDate: string
  kpis: {
    totalIncome: number
    totalExpenses: number
    net: number
    avgOccupancyRate: number
    orderCount: number
    checkInCount: number
    checkOutCount: number
    roomIncome: number
    fnbIncome: number
  }
  series: AdminAnalyticsSeriesPoint[]
  roomsByType: AdminNamedCount[]
  roomsByStatus: AdminNamedCount[]
  ordersByStatus: AdminNamedCount[]
  revenueBySource: AdminNamedCount[]
  topFoodItems: { name: string; quantity: number; revenue: number }[]
}

export type AdminSettings = {
  hotelName: string
  currency: string
  taxRate: number
  serviceChargeRate: number
  taxRatePercent: number
  serviceChargePercent: number
  note: string
}

export type UpdateAdminSettingsInput = {
  hotelName?: string
}

export type CreateAdminRoomInput = {
  number: string
  floor: number
  type: 'standard' | 'deluxe' | 'suite'
  name?: string
  description?: string
  amenities?: string[]
  capacity?: number
  bedType?: string
  sizeSqm?: number
  ratePerNight?: number
  imageUrl?: string
  note?: string
  status?: 'dirty' | 'in_progress' | 'clean' | 'inspect'
}

export type UpdateAdminRoomInput = {
  number?: string
  floor?: number
  type?: 'standard' | 'deluxe' | 'suite'
  name?: string
  description?: string
  amenities?: string[]
  capacity?: number
  bedType?: string
  sizeSqm?: number
  ratePerNight?: number
  imageUrl?: string
  note?: string | null
  status?: 'dirty' | 'in_progress' | 'clean' | 'inspect'
}

export type AdminMenuItem = {
  id: string
  name: string
  category: 'drinks' | 'food' | 'sides' | 'dessert'
  meals: Array<'breakfast' | 'lunch' | 'dinner'>
  price: number
  available: boolean
}

export type CreateAdminMenuItemInput = {
  id?: string
  name: string
  category: 'drinks' | 'food' | 'sides' | 'dessert'
  meals: Array<'breakfast' | 'lunch' | 'dinner'>
  price: number
  available?: boolean
}

export type UpdateAdminMenuItemInput = {
  name?: string
  category?: 'drinks' | 'food' | 'sides' | 'dessert'
  meals?: Array<'breakfast' | 'lunch' | 'dinner'>
  price?: number
  available?: boolean
}

export const ROOM_TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'suite', label: 'Suite' },
] as const

export const MENU_CATEGORY_OPTIONS = [
  { value: 'drinks', label: 'Drinks' },
  { value: 'food', label: 'Food' },
  { value: 'sides', label: 'Sides' },
  { value: 'dessert', label: 'Dessert' },
] as const

export const MENU_MEAL_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
] as const

export function roomTypeLabel(type: string): string {
  return ROOM_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}

export function roomStatusLabel(status: string): string {
  const map: Record<string, string> = {
    dirty: 'Dirty',
    in_progress: 'In progress',
    clean: 'Clean',
    inspect: 'Inspect',
  }
  return map[status] ?? status
}
