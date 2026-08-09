import type { IStoreItem } from '../models/StoreItem.js'
import type { IStockMovement } from '../models/StockMovement.js'
import type {
  StockMovementResponse,
  StoreItemResponse,
} from '../types/store.js'
import { roundMoney } from './payment.js'

export function toStoreItemResponse(item: IStoreItem): StoreItemResponse {
  const quantityOnHand = item.quantityOnHand
  const unitCost = roundMoney(item.unitCost)
  return {
    id: item._id.toString(),
    name: item.name,
    sku: item.sku,
    category: item.category,
    unit: item.unit,
    quantityOnHand,
    reorderLevel: item.reorderLevel,
    unitCost,
    stockValue: roundMoney(quantityOnHand * unitCost),
    isLowStock: quantityOnHand <= item.reorderLevel,
    note: item.note,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

type MovementWithItem = IStockMovement & {
  item?: IStoreItem | { _id: { toString(): string }; name?: string; sku?: string }
}

export function toStockMovementResponse(
  movement: MovementWithItem,
): StockMovementResponse {
  const populated = movement.item
  const itemId =
    populated && typeof populated === 'object' && '_id' in populated
      ? populated._id.toString()
      : movement.item?.toString?.() ?? String(movement.item)

  const itemName =
    populated && typeof populated === 'object' && 'name' in populated && populated.name
      ? populated.name
      : 'Unknown item'
  const itemSku =
    populated && typeof populated === 'object' && 'sku' in populated && populated.sku
      ? populated.sku
      : ''

  return {
    id: movement._id.toString(),
    itemId,
    itemName,
    itemSku,
    type: movement.type,
    quantity: movement.quantity,
    balanceAfter: movement.balanceAfter,
    department: movement.department,
    note: movement.note,
    createdAt: movement.createdAt.toISOString(),
  }
}
