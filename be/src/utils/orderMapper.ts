import type { IOrder } from '../models/Order.js'
import type { OrderResponse } from '../types/order.js'

export function toOrderResponse(order: IOrder): OrderResponse {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    type: order.type,
    location: order.location,
    items: order.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    subtotal: order.subtotal,
    tax: order.tax,
    serviceCharge: order.serviceCharge,
    total: order.total,
    taxRate: order.taxRate,
    serviceChargeRate: order.serviceChargeRate,
    status: order.status,
    note: order.note,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}
