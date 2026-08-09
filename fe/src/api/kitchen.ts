import type { MenuItem, Order, OrderStatus } from '../types/order'
import { apiFetch } from './client'

export function fetchKitchenMenu(): Promise<MenuItem[]> {
  return apiFetch<MenuItem[]>('/api/kitchen/menu')
}

export function updateMenuAvailability(
  itemId: string,
  available: boolean,
): Promise<MenuItem> {
  return apiFetch<MenuItem>(`/api/kitchen/menu/${itemId}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ available }),
  })
}

export function fetchKitchenOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/api/kitchen/orders')
}

export function updateKitchenOrderStatus(
  orderId: string,
  status: Extract<OrderStatus, 'preparing' | 'ready'>,
): Promise<Order> {
  return apiFetch<Order>(`/api/kitchen/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
