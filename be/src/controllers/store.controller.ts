import type { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { AppError } from '../middleware/errorHandler.js'
import { StoreItem } from '../models/StoreItem.js'
import { StockMovement } from '../models/StockMovement.js'
import {
  STOCK_MOVEMENT_TYPES,
  STORE_CATEGORIES,
  STORE_DEPARTMENTS,
  STORE_UNITS,
  type CreateStockMovementInput,
  type CreateStoreItemInput,
  type StockMovementType,
  type StoreCategory,
  type StoreDepartment,
  type StoreUnit,
  type UpdateStoreItemInput,
} from '../types/store.js'
import { roundMoney } from '../utils/payment.js'
import {
  toStockMovementResponse,
  toStoreItemResponse,
} from '../utils/storeMapper.js'
import { buildStoreOverview } from '../utils/storeOverview.js'

function isStoreCategory(value: unknown): value is StoreCategory {
  return typeof value === 'string' && STORE_CATEGORIES.includes(value as StoreCategory)
}

function isStoreUnit(value: unknown): value is StoreUnit {
  return typeof value === 'string' && STORE_UNITS.includes(value as StoreUnit)
}

function isMovementType(value: unknown): value is StockMovementType {
  return (
    typeof value === 'string' &&
    STOCK_MOVEMENT_TYPES.includes(value as StockMovementType)
  )
}

function isDepartment(value: unknown): value is StoreDepartment {
  return (
    typeof value === 'string' &&
    STORE_DEPARTMENTS.includes(value as StoreDepartment)
  )
}

function parseObjectId(id: string, label = 'id'): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400)
  }
  return new mongoose.Types.ObjectId(id)
}

function paramId(value: string | string[] | undefined, label = 'id'): string {
  const id = Array.isArray(value) ? value[0] : value
  if (!id) throw new AppError(`Missing ${label}`, 400)
  return id
}

export async function getStoreOverview(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await buildStoreOverview())
  } catch (error) {
    next(error)
  }
}

export async function getStoreItems(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const filter: Record<string, unknown> = {}
    const category = req.query.category
    if (isStoreCategory(category)) {
      filter.category = category
    }

    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
      ]
    }

    const items = await StoreItem.find(filter).sort({ name: 1 })
    let mapped = items.map(toStoreItemResponse)

    if (req.query.lowStock === 'true') {
      mapped = mapped.filter((item) => item.isLowStock)
    }

    const allForTotals = await StoreItem.find()
    const allMapped = allForTotals.map(toStoreItemResponse)

    res.json({
      items: mapped,
      total: mapped.length,
      lowStockCount: allMapped.filter((item) => item.isLowStock).length,
      totalStockValue: roundMoney(
        allMapped.reduce((sum, item) => sum + item.stockValue, 0),
      ),
    })
  } catch (error) {
    next(error)
  }
}

export async function getLowStockItems(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const items = await StoreItem.find().sort({ name: 1 })
    const lowStock = items
      .map(toStoreItemResponse)
      .filter((item) => item.isLowStock)
      .sort((a, b) => a.quantityOnHand - b.quantityOnHand)

    res.json({
      items: lowStock,
      total: lowStock.length,
      lowStockCount: lowStock.length,
      totalStockValue: roundMoney(
        lowStock.reduce((sum, item) => sum + item.stockValue, 0),
      ),
    })
  } catch (error) {
    next(error)
  }
}

export async function createStoreItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as CreateStoreItemInput
    if (!body.name?.trim()) throw new AppError('Name is required', 400)
    if (!body.sku?.trim()) throw new AppError('SKU is required', 400)
    if (!isStoreCategory(body.category)) {
      throw new AppError('Invalid category', 400)
    }
    if (!isStoreUnit(body.unit)) throw new AppError('Invalid unit', 400)

    const quantityOnHand = Number(body.quantityOnHand ?? 0)
    const reorderLevel = Number(body.reorderLevel ?? 0)
    const unitCost = Number(body.unitCost ?? 0)

    if (!Number.isFinite(quantityOnHand) || quantityOnHand < 0) {
      throw new AppError('quantityOnHand must be a non-negative number', 400)
    }
    if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
      throw new AppError('reorderLevel must be a non-negative number', 400)
    }
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      throw new AppError('unitCost must be a non-negative number', 400)
    }

    const sku = body.sku.trim().toUpperCase()
    const existing = await StoreItem.findOne({ sku })
    if (existing) throw new AppError('SKU already exists', 409)

    const item = await StoreItem.create({
      name: body.name.trim(),
      sku,
      category: body.category,
      unit: body.unit,
      quantityOnHand,
      reorderLevel,
      unitCost: roundMoney(unitCost),
      note: body.note?.trim() || undefined,
    })

    if (quantityOnHand > 0) {
      await StockMovement.create({
        item: item._id,
        type: 'receive',
        quantity: quantityOnHand,
        balanceAfter: quantityOnHand,
        note: 'Initial stock',
      })
    }

    res.status(201).json(toStoreItemResponse(item))
  } catch (error) {
    next(error)
  }
}

export async function updateStoreItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseObjectId(paramId(req.params.id, 'item id'), 'item id')
    const item = await StoreItem.findById(id)
    if (!item) throw new AppError('Item not found', 404)

    const body = req.body as UpdateStoreItemInput

    if (body.name !== undefined) {
      if (!body.name.trim()) throw new AppError('Name cannot be empty', 400)
      item.name = body.name.trim()
    }
    if (body.sku !== undefined) {
      const sku = body.sku.trim().toUpperCase()
      if (!sku) throw new AppError('SKU cannot be empty', 400)
      const clash = await StoreItem.findOne({ sku, _id: { $ne: item._id } })
      if (clash) throw new AppError('SKU already exists', 409)
      item.sku = sku
    }
    if (body.category !== undefined) {
      if (!isStoreCategory(body.category)) {
        throw new AppError('Invalid category', 400)
      }
      item.category = body.category
    }
    if (body.unit !== undefined) {
      if (!isStoreUnit(body.unit)) throw new AppError('Invalid unit', 400)
      item.unit = body.unit
    }
    if (body.reorderLevel !== undefined) {
      const reorderLevel = Number(body.reorderLevel)
      if (!Number.isFinite(reorderLevel) || reorderLevel < 0) {
        throw new AppError('reorderLevel must be a non-negative number', 400)
      }
      item.reorderLevel = reorderLevel
    }
    if (body.unitCost !== undefined) {
      const unitCost = Number(body.unitCost)
      if (!Number.isFinite(unitCost) || unitCost < 0) {
        throw new AppError('unitCost must be a non-negative number', 400)
      }
      item.unitCost = roundMoney(unitCost)
    }
    if (body.note !== undefined) {
      item.note = body.note?.trim() ? body.note.trim() : undefined
    }

    await item.save()
    res.json(toStoreItemResponse(item))
  } catch (error) {
    next(error)
  }
}

export async function deleteStoreItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseObjectId(paramId(req.params.id, 'item id'), 'item id')
    const item = await StoreItem.findByIdAndDelete(id)
    if (!item) throw new AppError('Item not found', 404)
    await StockMovement.deleteMany({ item: id })
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

export async function getStockMovements(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const filter: Record<string, unknown> = {}
    const itemId = typeof req.query.itemId === 'string' ? req.query.itemId : ''
    if (itemId) {
      filter.item = parseObjectId(itemId, 'item id')
    }
    if (isMovementType(req.query.type)) {
      filter.type = req.query.type
    }

    const limitRaw = Number(req.query.limit ?? 50)
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 200)
      : 50

    const movements = await StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('item')

    res.json(movements.map(toStockMovementResponse))
  } catch (error) {
    next(error)
  }
}

export async function createStockMovement(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as CreateStockMovementInput
    if (!body.itemId) throw new AppError('itemId is required', 400)
    if (!isMovementType(body.type)) throw new AppError('Invalid movement type', 400)

    const quantity = Number(body.quantity)
    if (!Number.isFinite(quantity) || quantity === 0) {
      throw new AppError('quantity must be a non-zero number', 400)
    }

    if (body.type !== 'adjust' && quantity < 0) {
      throw new AppError('quantity must be positive for receive/issue', 400)
    }

    if (body.department !== undefined && !isDepartment(body.department)) {
      throw new AppError('Invalid department', 400)
    }

    const itemId = parseObjectId(body.itemId, 'item id')
    const item = await StoreItem.findById(itemId)
    if (!item) throw new AppError('Item not found', 404)

    let nextQty = item.quantityOnHand
    let recordedQty = quantity

    if (body.type === 'receive') {
      nextQty = item.quantityOnHand + quantity
      recordedQty = quantity
    } else if (body.type === 'issue') {
      if (quantity > item.quantityOnHand) {
        throw new AppError('Insufficient stock on hand', 400)
      }
      nextQty = item.quantityOnHand - quantity
      recordedQty = -quantity
    } else {
      // adjust: quantity is the absolute new balance
      if (quantity < 0) throw new AppError('Adjusted quantity cannot be negative', 400)
      recordedQty = quantity - item.quantityOnHand
      nextQty = quantity
    }

    item.quantityOnHand = nextQty
    await item.save()

    const movement = await StockMovement.create({
      item: item._id,
      type: body.type,
      quantity: recordedQty,
      balanceAfter: nextQty,
      department:
        body.type === 'issue'
          ? body.department ?? 'other'
          : body.department,
      note: body.note?.trim() || undefined,
    })

    await movement.populate('item')
    res.status(201).json(toStockMovementResponse(movement))
  } catch (error) {
    next(error)
  }
}
