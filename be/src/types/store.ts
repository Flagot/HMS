export const STORE_CATEGORIES = [
  'fnb',
  'housekeeping',
  'amenities',
  'maintenance',
  'office',
  'other',
] as const

export type StoreCategory = (typeof STORE_CATEGORIES)[number]

export const STORE_UNITS = ['pcs', 'kg', 'L', 'box', 'pack', 'bottle'] as const

export type StoreUnit = (typeof STORE_UNITS)[number]

export const STOCK_MOVEMENT_TYPES = ['receive', 'issue', 'adjust'] as const

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number]

export const STORE_DEPARTMENTS = [
  'kitchen',
  'housekeeping',
  'reception',
  'maintenance',
  'bar',
  'other',
] as const

export type StoreDepartment = (typeof STORE_DEPARTMENTS)[number]

export type StoreItemResponse = {
  id: string
  name: string
  sku: string
  category: StoreCategory
  unit: StoreUnit
  quantityOnHand: number
  reorderLevel: number
  unitCost: number
  stockValue: number
  isLowStock: boolean
  note?: string
  createdAt: string
  updatedAt: string
}

export type StockMovementResponse = {
  id: string
  itemId: string
  itemName: string
  itemSku: string
  type: StockMovementType
  quantity: number
  balanceAfter: number
  department?: StoreDepartment
  note?: string
  createdAt: string
}

export type StoreOverview = {
  totalItems: number
  lowStockCount: number
  totalStockValue: number
  movementsToday: number
  receivedToday: number
  issuedToday: number
  categoryCounts: { category: StoreCategory; count: number }[]
  recentMovements: StockMovementResponse[]
  lowStockItems: StoreItemResponse[]
}

export type StoreItemsResult = {
  items: StoreItemResponse[]
  total: number
  lowStockCount: number
  totalStockValue: number
}

export type CreateStoreItemInput = {
  name: string
  sku: string
  category: StoreCategory
  unit: StoreUnit
  quantityOnHand?: number
  reorderLevel?: number
  unitCost?: number
  note?: string
}

export type UpdateStoreItemInput = {
  name?: string
  sku?: string
  category?: StoreCategory
  unit?: StoreUnit
  reorderLevel?: number
  unitCost?: number
  note?: string | null
}

export type CreateStockMovementInput = {
  itemId: string
  type: StockMovementType
  quantity: number
  department?: StoreDepartment
  note?: string
}
