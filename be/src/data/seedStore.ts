import type { StoreCategory, StoreUnit } from '../types/store.js'

export type SeedStoreItem = {
  name: string
  sku: string
  category: StoreCategory
  unit: StoreUnit
  quantityOnHand: number
  reorderLevel: number
  unitCost: number
  note?: string
}

export const seedStoreItems: SeedStoreItem[] = [
  {
    name: 'Bath towels',
    sku: 'HK-TW-001',
    category: 'housekeeping',
    unit: 'pcs',
    quantityOnHand: 120,
    reorderLevel: 40,
    unitCost: 85,
  },
  {
    name: 'Bed sheets (queen)',
    sku: 'HK-SH-002',
    category: 'housekeeping',
    unit: 'pcs',
    quantityOnHand: 28,
    reorderLevel: 30,
    unitCost: 220,
    note: 'Below reorder — restock soon',
  },
  {
    name: 'Toilet paper rolls',
    sku: 'AM-TP-010',
    category: 'amenities',
    unit: 'pack',
    quantityOnHand: 65,
    reorderLevel: 20,
    unitCost: 45,
  },
  {
    name: 'Shampoo bottles',
    sku: 'AM-SH-011',
    category: 'amenities',
    unit: 'bottle',
    quantityOnHand: 18,
    reorderLevel: 25,
    unitCost: 35,
  },
  {
    name: 'Cooking oil',
    sku: 'FB-OL-020',
    category: 'fnb',
    unit: 'L',
    quantityOnHand: 40,
    reorderLevel: 15,
    unitCost: 95,
  },
  {
    name: 'Rice (basmati)',
    sku: 'FB-RI-021',
    category: 'fnb',
    unit: 'kg',
    quantityOnHand: 12,
    reorderLevel: 20,
    unitCost: 78,
  },
  {
    name: 'Bottled water (500ml)',
    sku: 'FB-WT-022',
    category: 'fnb',
    unit: 'box',
    quantityOnHand: 48,
    reorderLevel: 12,
    unitCost: 160,
  },
  {
    name: 'Light bulbs (LED)',
    sku: 'MT-LB-030',
    category: 'maintenance',
    unit: 'pcs',
    quantityOnHand: 35,
    reorderLevel: 15,
    unitCost: 55,
  },
  {
    name: 'AC filter kits',
    sku: 'MT-AF-031',
    category: 'maintenance',
    unit: 'pcs',
    quantityOnHand: 4,
    reorderLevel: 6,
    unitCost: 480,
  },
  {
    name: 'Printer paper A4',
    sku: 'OF-PP-040',
    category: 'office',
    unit: 'box',
    quantityOnHand: 10,
    reorderLevel: 3,
    unitCost: 320,
  },
  {
    name: 'Laundry detergent',
    sku: 'HK-DT-003',
    category: 'housekeeping',
    unit: 'kg',
    quantityOnHand: 22,
    reorderLevel: 10,
    unitCost: 65,
  },
  {
    name: 'Coffee beans',
    sku: 'FB-CF-023',
    category: 'fnb',
    unit: 'kg',
    quantityOnHand: 8,
    reorderLevel: 5,
    unitCost: 420,
  },
]
