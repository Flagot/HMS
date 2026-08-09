import type { OrderLine, OrderStatus, OrderType } from '../types/order.js'
import { calculateOrderTotals } from '../utils/pricing.js'
import { sumLineTotals } from '../utils/orderItems.js'

type SeedOrder = {
  orderNumber: string
  type: OrderType
  location: string
  items: OrderLine[]
  subtotal: number
  tax: number
  serviceCharge: number
  total: number
  taxRate: number
  serviceChargeRate: number
  status: OrderStatus
  note?: string
  createdAt: Date
  updatedAt: Date
}

function withTotals(
  base: Omit<
    SeedOrder,
    'subtotal' | 'tax' | 'serviceCharge' | 'total' | 'taxRate' | 'serviceChargeRate'
  >,
): SeedOrder {
  const totals = calculateOrderTotals(sumLineTotals(base.items))
  return { ...base, ...totals }
}

export const seedOrders: SeedOrder[] = [
  withTotals({
    orderNumber: 'W-1001',
    type: 'table',
    location: '3',
    items: [
      {
        menuItemId: 'coca-cola',
        name: 'Coca-Cola',
        quantity: 4,
        unitPrice: 40,
        lineTotal: 160,
      },
      {
        menuItemId: 'club-sandwich',
        name: 'Club Sandwich',
        quantity: 2,
        unitPrice: 190,
        lineTotal: 380,
      },
    ],
    status: 'pending',
    createdAt: new Date('2026-08-09T11:00:00'),
    updatedAt: new Date('2026-08-09T11:00:00'),
  }),
  withTotals({
    orderNumber: 'W-1002',
    type: 'room_service',
    location: '204',
    items: [
      {
        menuItemId: 'eggs-benedict',
        name: 'Eggs Benedict',
        quantity: 1,
        unitPrice: 160,
        lineTotal: 160,
      },
      {
        menuItemId: 'orange-juice',
        name: 'Orange Juice',
        quantity: 1,
        unitPrice: 45,
        lineTotal: 45,
      },
      {
        menuItemId: 'coffee',
        name: 'Coffee',
        quantity: 1,
        unitPrice: 35,
        lineTotal: 35,
      },
    ],
    status: 'preparing',
    note: 'No mushrooms',
    createdAt: new Date('2026-08-09T10:45:00'),
    updatedAt: new Date('2026-08-09T10:50:00'),
  }),
  withTotals({
    orderNumber: 'W-1003',
    type: 'table',
    location: '12',
    items: [
      {
        menuItemId: 'caesar-salad',
        name: 'Caesar Salad',
        quantity: 1,
        unitPrice: 150,
        lineTotal: 150,
      },
      {
        menuItemId: 'grilled-salmon',
        name: 'Grilled Salmon',
        quantity: 1,
        unitPrice: 380,
        lineTotal: 380,
      },
      {
        menuItemId: 'sparkling-water',
        name: 'Sparkling Water',
        quantity: 2,
        unitPrice: 30,
        lineTotal: 60,
      },
    ],
    status: 'ready',
    createdAt: new Date('2026-08-09T10:20:00'),
    updatedAt: new Date('2026-08-09T11:05:00'),
  }),
  withTotals({
    orderNumber: 'W-1004',
    type: 'room_service',
    location: '301',
    items: [
      {
        menuItemId: 'club-sandwich',
        name: 'Club Sandwich',
        quantity: 1,
        unitPrice: 190,
        lineTotal: 190,
      },
      {
        menuItemId: 'fruit-bowl',
        name: 'Fruit Bowl',
        quantity: 1,
        unitPrice: 90,
        lineTotal: 90,
      },
    ],
    status: 'served',
    createdAt: new Date('2026-08-09T09:30:00'),
    updatedAt: new Date('2026-08-09T10:10:00'),
  }),
  withTotals({
    orderNumber: 'W-1005',
    type: 'table',
    location: '2',
    items: [
      {
        menuItemId: 'cappuccino',
        name: 'Cappuccino',
        quantity: 3,
        unitPrice: 55,
        lineTotal: 165,
      },
      {
        menuItemId: 'croissant-platter',
        name: 'Croissant Platter',
        quantity: 1,
        unitPrice: 120,
        lineTotal: 120,
      },
    ],
    status: 'pending',
    note: 'Window seat',
    createdAt: new Date('2026-08-09T11:10:00'),
    updatedAt: new Date('2026-08-09T11:10:00'),
  }),
  withTotals({
    orderNumber: 'W-1006',
    type: 'table',
    location: '8',
    items: [
      {
        menuItemId: 'pasta-carbonara',
        name: 'Pasta Carbonara',
        quantity: 2,
        unitPrice: 240,
        lineTotal: 480,
      },
      {
        menuItemId: 'house-red-wine',
        name: 'House Red Wine',
        quantity: 1,
        unitPrice: 180,
        lineTotal: 180,
      },
    ],
    status: 'preparing',
    createdAt: new Date('2026-08-09T10:55:00'),
    updatedAt: new Date('2026-08-09T11:00:00'),
  }),
  withTotals({
    orderNumber: 'W-1007',
    type: 'room_service',
    location: '102',
    items: [
      {
        menuItemId: 'club-sandwich',
        name: 'Club Sandwich',
        quantity: 1,
        unitPrice: 190,
        lineTotal: 190,
      },
      {
        menuItemId: 'tomato-soup',
        name: 'Tomato Soup',
        quantity: 1,
        unitPrice: 95,
        lineTotal: 95,
      },
      {
        menuItemId: 'still-water',
        name: 'Still Water',
        quantity: 1,
        unitPrice: 25,
        lineTotal: 25,
      },
    ],
    status: 'ready',
    note: 'Knock softly',
    createdAt: new Date('2026-08-09T10:40:00'),
    updatedAt: new Date('2026-08-09T11:12:00'),
  }),
  withTotals({
    orderNumber: 'W-1008',
    type: 'table',
    location: '6',
    items: [
      {
        menuItemId: 'cheeseburger',
        name: 'Cheeseburger',
        quantity: 1,
        unitPrice: 220,
        lineTotal: 220,
      },
      {
        menuItemId: 'fries',
        name: 'Fries',
        quantity: 1,
        unitPrice: 70,
        lineTotal: 70,
      },
      {
        menuItemId: 'coca-cola',
        name: 'Coca-Cola',
        quantity: 1,
        unitPrice: 40,
        lineTotal: 40,
      },
    ],
    status: 'served',
    createdAt: new Date('2026-08-09T09:00:00'),
    updatedAt: new Date('2026-08-09T09:40:00'),
  }),
]
