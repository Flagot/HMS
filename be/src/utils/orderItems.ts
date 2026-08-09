import type { IMenuItem } from '../models/MenuItem.js'
import type { OrderLine } from '../types/order.js'
import { AppError } from '../middleware/errorHandler.js'
import { roundMoney } from './pricing.js'

type IncomingLine = {
  menuItemId?: string
  quantity?: number
}

type NormalizeOptions = {
  /** Menu item ids already on the order — may keep qty even if now unavailable */
  existingItemIds?: Set<string>
}

export function normalizeOrderItems(
  rawItems: unknown,
  menuById: Map<string, IMenuItem>,
  options: NormalizeOptions = {},
): OrderLine[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new AppError('At least one menu item is required', 400)
  }

  const quantities = new Map<string, number>()
  const existingItemIds = options.existingItemIds ?? new Set<string>()

  for (const raw of rawItems as IncomingLine[]) {
    if (!raw?.menuItemId || typeof raw.menuItemId !== 'string') {
      throw new AppError('Each item needs a valid menuItemId', 400)
    }

    const menuItem = menuById.get(raw.menuItemId)
    if (!menuItem) {
      throw new AppError(`Unknown menu item: ${raw.menuItemId}`, 400)
    }

    const quantity = Number(raw.quantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new AppError('Quantity must be a whole number of at least 1', 400)
    }

    if (!menuItem.available && !existingItemIds.has(raw.menuItemId)) {
      throw new AppError(`${menuItem.name} is currently unavailable`, 400)
    }

    quantities.set(raw.menuItemId, (quantities.get(raw.menuItemId) ?? 0) + quantity)
  }

  return [...quantities.entries()].map(([menuItemId, quantity]) => {
    const menuItem = menuById.get(menuItemId)!
    const unitPrice = roundMoney(menuItem.price)
    return {
      menuItemId,
      name: menuItem.name,
      quantity,
      unitPrice,
      lineTotal: roundMoney(unitPrice * quantity),
    }
  })
}

export function sumLineTotals(items: OrderLine[]): number {
  return roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0))
}
