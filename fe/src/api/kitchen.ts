import type { MenuItem } from '../types/order'
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
