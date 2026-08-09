import type { Request, Response, NextFunction } from 'express'
import { MenuItem } from '../models/MenuItem.js'
import { Order } from '../models/Order.js'
import { listMenuItems, toMenuItemResponse } from '../services/menuService.js'
import type { OrderStatus } from '../types/order.js'
import { isValidOrderStatusTransition } from '../utils/orderStatusTransitions.js'
import { toOrderResponse } from '../utils/orderMapper.js'
import { AppError } from '../middleware/errorHandler.js'

const kitchenStatuses: OrderStatus[] = ['pending', 'preparing', 'ready']
const kitchenTransitions: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'preparing',
  preparing: 'ready',
}

export async function getKitchenMenu(
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

export async function updateMenuAvailability(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { available } = req.body as { available?: boolean }

    if (typeof available !== 'boolean') {
      throw new AppError('available must be a boolean', 400)
    }

    const item = await MenuItem.findOneAndUpdate(
      { itemId: id },
      { available },
      { new: true },
    )

    if (!item) {
      throw new AppError('Menu item not found', 404)
    }

    res.json(toMenuItemResponse(item))
  } catch (error) {
    next(error)
  }
}

export async function getKitchenOrders(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { status } = req.query
    const filter: { status?: OrderStatus | { $in: OrderStatus[] } } = {}

    if (typeof status === 'string' && kitchenStatuses.includes(status as OrderStatus)) {
      filter.status = status as OrderStatus
    } else {
      filter.status = { $in: kitchenStatuses }
    }

    const orders = await Order.find(filter).sort({ updatedAt: 1 })
    res.json(orders.map(toOrderResponse))
  } catch (error) {
    next(error)
  }
}

export async function updateKitchenOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { status } = req.body as { status?: OrderStatus }

    if (!status || !['preparing', 'ready'].includes(status)) {
      throw new AppError('Kitchen can only set status to preparing or ready', 400)
    }

    const order = await Order.findById(id)
    if (!order) {
      throw new AppError('Order not found', 404)
    }

    const expected = kitchenTransitions[order.status]
    if (expected !== status || !isValidOrderStatusTransition(order.status, status)) {
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
