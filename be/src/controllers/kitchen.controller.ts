import type { Request, Response, NextFunction } from 'express'
import { MenuItem } from '../models/MenuItem.js'
import { listMenuItems, toMenuItemResponse } from '../services/menuService.js'
import { AppError } from '../middleware/errorHandler.js'

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
