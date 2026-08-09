import type { MenuItem, Order, OrderStatus, CreateOrderInput, UpdateOrderItemsInput } from '../types/order'
import { apiFetch } from './client'

export function fetchMenu(): Promise<MenuItem[]> {
  return apiFetch<MenuItem[]>('/api/waiter/menu')
}

export function fetchOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/api/waiter/orders')
}

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiFetch<Order>('/api/waiter/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateOrderItems(
  orderId: string,
  input: UpdateOrderItemsInput,
): Promise<Order> {
  return apiFetch<Order>(`/api/waiter/orders/${orderId}/items`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  return apiFetch<Order>(`/api/waiter/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function updateOrderPayment(
  orderId: string,
  paid: boolean,
): Promise<Order> {
  return apiFetch<Order>(`/api/waiter/orders/${orderId}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ paid }),
  })
}
