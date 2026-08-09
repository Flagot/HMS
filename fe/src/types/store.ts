export const STORE_CATEGORIES = [
  'fnb',
  'housekeeping',
  'amenities',
  'maintenance',
  'office',
  'other',
] as const

export type StoreCategory = (typeof STORE_CATEGORIES)[number]

export const STORE_CATEGORY_OPTIONS: { value: StoreCategory; label: string }[] = [
  { value: 'fnb', label: 'F&B' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'office', label: 'Office' },
  { value: 'other', label: 'Other' },
]

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

export const STORE_DEPARTMENT_OPTIONS: {
  value: StoreDepartment
  label: string
}[] = [
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'reception', label: 'Reception' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'bar', label: 'Bar' },
  { value: 'other', label: 'Other' },
]

export type StoreItem = {
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

export type StockMovement = {
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
  recentMovements: StockMovement[]
  lowStockItems: StoreItem[]
}

export type StoreItemsResult = {
  items: StoreItem[]
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

export function categoryLabel(category: StoreCategory): string {
  return STORE_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? category
}

export function departmentLabel(department: StoreDepartment): string {
  return (
    STORE_DEPARTMENT_OPTIONS.find((o) => o.value === department)?.label ??
    department
  )
}

export function movementTypeLabel(type: StockMovementType): string {
  if (type === 'receive') return 'Receive'
  if (type === 'issue') return 'Issue'
  return 'Adjust'
}
