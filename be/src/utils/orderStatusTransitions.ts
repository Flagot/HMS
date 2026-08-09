import type { OrderStatus } from '../types/order.js'

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['preparing'],
  preparing: ['ready'],
  ready: ['served'],
  served: [],
}

export function isValidOrderStatusTransition(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  return allowedTransitions[current].includes(next)
}
