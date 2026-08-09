import type { Request, Response, NextFunction } from 'express'
import { Order } from '../models/Order.js'
import { getMenuItemMap, listMenuItems } from '../services/menuService.js'
import type { OrderStatus, OrderType } from '../types/order.js'
import { normalizeOrderItems, sumLineTotals } from '../utils/orderItems.js'
import { calculateOrderTotals } from '../utils/pricing.js'
import { isValidOrderStatusTransition } from '../utils/orderStatusTransitions.js'
import { toOrderResponse } from '../utils/orderMapper.js'
import { AppError } from '../middleware/errorHandler.js'

const validStatuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'served']
const validTypes: OrderType[] = ['table', 'room_service']
const editableStatuses: OrderStatus[] = ['pending', 'preparing', 'ready']

async function nextOrderNumber(): Promise<string> {
  const latest = await Order.findOne().sort({ orderNumber: -1 }).select('orderNumber')
  if (!latest?.orderNumber) {
    return 'W-1001'
  }

  const match = /^W-(\d+)$/.exec(latest.orderNumber)
  const next = match ? Number(match[1]) + 1 : Date.now() % 100000
  return `W-${String(next).padStart(4, '0')}`
}

function buildOrderPricing(items: ReturnType<typeof normalizeOrderItems>) {
  const totals = calculateOrderTotals(sumLineTotals(items))
  return { items, ...totals }
}

export async function getMenu(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await listMenuItems())
  } catch (error) {
    next(error)
  }
}

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { status, type } = req.query
    const filter: { status?: OrderStatus; type?: OrderType } = {}

    if (typeof status === 'string' && validStatuses.includes(status as OrderStatus)) {
      filter.status = status as OrderStatus
    }

    if (typeof type === 'string' && validTypes.includes(type as OrderType)) {
      filter.type = type as OrderType
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 })
    res.json(orders.map(toOrderResponse))
  } catch (error) {
    next(error)
  }
}

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { type, location, items, note } = req.body as {
      type?: OrderType
      location?: string
      items?: unknown
      note?: string
    }

    if (!type || !validTypes.includes(type)) {
      throw new AppError('Invalid order type', 400)
    }

    if (!location?.trim()) {
      throw new AppError('Location is required', 400)
    }

    const menuById = await getMenuItemMap()
    const priced = buildOrderPricing(normalizeOrderItems(items, menuById))

    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
      type,
      location: location.trim(),
      ...priced,
      note: note?.trim() || undefined,
      status: 'pending',
    })

    res.status(201).json(toOrderResponse(order))
  } catch (error) {
    next(error)
  }
}

export async function updateOrderItems(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { items, note } = req.body as { items?: unknown; note?: string }

    const order = await Order.findById(id)
    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (!editableStatuses.includes(order.status)) {
      throw new AppError('Served orders cannot be edited', 400)
    }

    const menuById = await getMenuItemMap()
    const existingItemIds = new Set(order.items.map((item) => item.menuItemId))
    const priced = buildOrderPricing(
      normalizeOrderItems(items, menuById, { existingItemIds }),
    )

    order.items = priced.items
    order.subtotal = priced.subtotal
    order.tax = priced.tax
    order.serviceCharge = priced.serviceCharge
    order.total = priced.total
    order.taxRate = priced.taxRate
    order.serviceChargeRate = priced.serviceChargeRate

    if (note !== undefined) {
      order.note = note.trim() || undefined
    }

    await order.save()
    res.json(toOrderResponse(order))
  } catch (error) {
    next(error)
  }
}

export async function updateOrderPayment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { paid } = req.body as { paid?: boolean }

    if (typeof paid !== 'boolean') {
      throw new AppError('Payment value must be true or false', 400)
    }

    const order = await Order.findById(id)
    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (paid) {
      if (order.status !== 'served') {
        throw new AppError('Only served orders can be marked as paid', 400)
      }
      order.paymentStatus = 'paid'
      order.paidAt = new Date()
    } else {
      order.paymentStatus = 'unpaid'
      order.paidAt = undefined
    }

    await order.save()
    res.json(toOrderResponse(order))
  } catch (error) {
    next(error)
  }
}

export async function updateOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { status } = req.body as { status?: OrderStatus }

    if (!status || !validStatuses.includes(status)) {
      throw new AppError('Invalid status value', 400)
    }

    const order = await Order.findById(id)
    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (!isValidOrderStatusTransition(order.status, status)) {
      throw new AppError(
        `Cannot change status from "${order.status}" to "${status}"`,
        400,
      )
    }

    order.status = status
    await order.save()
    res.json(toOrderResponse(order))
  } catch (error) {
    next(error)
  }
}
