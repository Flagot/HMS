export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served'

export type OrderPaymentStatus = 'unpaid' | 'paid'

export type OrderType = 'table' | 'room_service'

export type MenuCategory = 'drinks' | 'food' | 'sides' | 'dessert'

export type MenuMeal = 'breakfast' | 'lunch' | 'dinner'

export type MenuItem = {
  id: string
  name: string
  category: MenuCategory
  meals: MenuMeal[]
  price: number
  available: boolean
}

export type OrderLine = {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type Order = {
  id: string
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
  paymentStatus: OrderPaymentStatus
  paidAt?: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type OrderItemInput = {
  menuItemId: string
  quantity: number
}

export type CreateOrderInput = {
  type: OrderType
  location: string
  items: OrderItemInput[]
  note?: string
}

export type UpdateOrderItemsInput = {
  items: OrderItemInput[]
  note?: string
}
