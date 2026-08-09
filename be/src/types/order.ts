export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served'

export type OrderType = 'table' | 'room_service'

export type OrderLine = {
  menuItemId: string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type OrderResponse = {
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
  note?: string
  createdAt: string
  updatedAt: string
}
