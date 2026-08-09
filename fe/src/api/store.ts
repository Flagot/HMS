import type {
  CreateStockMovementInput,
  CreateStoreItemInput,
  StockMovement,
  StoreCategory,
  StoreItem,
  StoreItemsResult,
  StoreOverview,
  UpdateStoreItemInput,
} from '../types/store'
import { apiFetch } from './client'

export function fetchStoreOverview(): Promise<StoreOverview> {
  return apiFetch<StoreOverview>('/api/store/overview')
}

export function fetchStoreItems(params?: {
  category?: StoreCategory | 'all'
  q?: string
  lowStock?: boolean
}): Promise<StoreItemsResult> {
  const search = new URLSearchParams()
  if (params?.category && params.category !== 'all') {
    search.set('category', params.category)
  }
  if (params?.q?.trim()) search.set('q', params.q.trim())
  if (params?.lowStock) search.set('lowStock', 'true')
  const query = search.toString()
  return apiFetch<StoreItemsResult>(`/api/store/items${query ? `?${query}` : ''}`)
}

export function fetchLowStockItems(): Promise<StoreItemsResult> {
  return apiFetch<StoreItemsResult>('/api/store/items/low-stock')
}

export function createStoreItem(input: CreateStoreItemInput): Promise<StoreItem> {
  return apiFetch<StoreItem>('/api/store/items', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateStoreItem(
  id: string,
  input: UpdateStoreItemInput,
): Promise<StoreItem> {
  return apiFetch<StoreItem>(`/api/store/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteStoreItem(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/store/items/${id}`, {
    method: 'DELETE',
  })
}

export function fetchStockMovements(params?: {
  itemId?: string
  type?: string
  limit?: number
}): Promise<StockMovement[]> {
  const search = new URLSearchParams()
  if (params?.itemId) search.set('itemId', params.itemId)
  if (params?.type) search.set('type', params.type)
  if (params?.limit) search.set('limit', String(params.limit))
  const query = search.toString()
  return apiFetch<StockMovement[]>(
    `/api/store/movements${query ? `?${query}` : ''}`,
  )
}

export function createStockMovement(
  input: CreateStockMovementInput,
): Promise<StockMovement> {
  return apiFetch<StockMovement>('/api/store/movements', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
