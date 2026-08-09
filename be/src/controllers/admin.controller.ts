import type { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { AppError } from '../middleware/errorHandler.js'
import { MenuItem } from '../models/MenuItem.js'
import { Reservation } from '../models/Reservation.js'
import { Room } from '../models/Room.js'
import type {
  CreateAdminMenuItemInput,
  CreateAdminRoomInput,
  UpdateAdminMenuItemInput,
  UpdateAdminRoomInput,
  UpdateAdminSettingsInput,
} from '../types/admin.js'
import type { MenuCategory, MenuMeal } from '../data/menuCatalog.js'
import type { RoomStatus, RoomType } from '../types/room.js'
import { roundMoney } from '../utils/payment.js'
import { toRoomResponse } from '../utils/roomMapper.js'
import {
  buildAdminOverview,
  buildAdminSettings,
  getOrCreateHotelSettings,
} from '../utils/adminOverview.js'
import { buildAdminAnalytics } from '../utils/adminAnalytics.js'
import {
  ensureMenuSeeded,
  listMenuItems,
  toMenuItemResponse,
} from '../services/menuService.js'
import type { AdminPeriod } from '../types/admin.js'

const ROOM_TYPES: RoomType[] = ['standard', 'deluxe', 'suite']
const ROOM_STATUSES: RoomStatus[] = ['dirty', 'in_progress', 'clean', 'inspect']
const MENU_CATEGORIES: MenuCategory[] = ['drinks', 'food', 'sides', 'dessert']
const MENU_MEALS: MenuMeal[] = ['breakfast', 'lunch', 'dinner']

function paramId(value: string | string[] | undefined, label = 'id'): string {
  const id = Array.isArray(value) ? value[0] : value
  if (!id) throw new AppError(`Missing ${label}`, 400)
  return id
}

function parseObjectId(id: string, label = 'id'): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${label}`, 400)
  }
  return new mongoose.Types.ObjectId(id)
}

function isRoomType(value: unknown): value is RoomType {
  return typeof value === 'string' && ROOM_TYPES.includes(value as RoomType)
}

function isRoomStatus(value: unknown): value is RoomStatus {
  return typeof value === 'string' && ROOM_STATUSES.includes(value as RoomStatus)
}

function isMenuCategory(value: unknown): value is MenuCategory {
  return (
    typeof value === 'string' &&
    MENU_CATEGORIES.includes(value as MenuCategory)
  )
}

function isMenuMeal(value: unknown): value is MenuMeal {
  return typeof value === 'string' && MENU_MEALS.includes(value as MenuMeal)
}

function slugifyMenuId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function parseDay(dateParam?: string): Date {
  const day = dateParam ? new Date(`${dateParam}T12:00:00.000Z`) : new Date()
  if (Number.isNaN(day.getTime())) {
    throw new AppError('Invalid date', 400)
  }
  return day
}

function parsePeriod(periodParam?: unknown): AdminPeriod {
  if (
    periodParam === 'day' ||
    periodParam === 'week' ||
    periodParam === 'month'
  ) {
    return periodParam
  }
  return 'day'
}

export async function getAdminOverview(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await buildAdminOverview())
  } catch (error) {
    next(error)
  }
}

export async function getAdminAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined
    const analytics = await buildAdminAnalytics(
      parsePeriod(req.query.period),
      parseDay(dateParam),
    )
    res.json(analytics)
  } catch (error) {
    next(error)
  }
}

export async function getAdminSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(await buildAdminSettings())
  } catch (error) {
    next(error)
  }
}

export async function updateAdminSettings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as UpdateAdminSettingsInput
    const settings = await getOrCreateHotelSettings()

    if (body.hotelName !== undefined) {
      const hotelName = body.hotelName.trim()
      if (!hotelName) throw new AppError('Hotel name cannot be empty', 400)
      settings.hotelName = hotelName
      await settings.save()
    }

    res.json(await buildAdminSettings())
  } catch (error) {
    next(error)
  }
}

export async function getAdminRooms(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rooms = await Room.find().sort({
      floor: 1,
      number: 1,
    })
    res.json(rooms.map(toRoomResponse))
  } catch (error) {
    next(error)
  }
}

export async function createAdminRoom(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as CreateAdminRoomInput
    if (!body.number?.trim()) throw new AppError('Room number is required', 400)
    const floor = Number(body.floor)
    if (!Number.isFinite(floor) || floor < 1) {
      throw new AppError('Floor must be a positive number', 400)
    }
    if (!isRoomType(body.type)) throw new AppError('Invalid room type', 400)

    const number = body.number.trim()
    const existing = await Room.findOne({ number })
    if (existing) throw new AppError('Room number already exists', 409)

    const ratePerNight = Number(body.ratePerNight ?? 0)
    const capacity = Number(body.capacity ?? 2)
    const sizeSqm = Number(body.sizeSqm ?? 20)
    if (!Number.isFinite(ratePerNight) || ratePerNight < 0) {
      throw new AppError('ratePerNight must be a non-negative number', 400)
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      throw new AppError('capacity must be at least 1', 400)
    }
    if (!Number.isFinite(sizeSqm) || sizeSqm < 1) {
      throw new AppError('sizeSqm must be at least 1', 400)
    }

    const status = isRoomStatus(body.status) ? body.status : 'clean'
    const amenities = Array.isArray(body.amenities)
      ? body.amenities.map((a) => String(a).trim()).filter(Boolean)
      : []

    const room = await Room.create({
      number,
      floor,
      type: body.type,
      status,
      name: body.name?.trim() || `Room ${number}`,
      description:
        body.description?.trim() ||
        'Comfortable guest room with essential amenities.',
      amenities,
      capacity,
      bedType: body.bedType?.trim() || 'Queen',
      sizeSqm,
      ratePerNight: roundMoney(ratePerNight),
      imageUrl:
        body.imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      note: body.note?.trim() || undefined,
    })

    res.status(201).json(toRoomResponse(room))
  } catch (error) {
    next(error)
  }
}

export async function updateAdminRoom(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseObjectId(paramId(req.params.id, 'room id'), 'room id')
    const room = await Room.findById(id)
    if (!room) throw new AppError('Room not found', 404)

    const body = req.body as UpdateAdminRoomInput

    if (body.number !== undefined) {
      const number = body.number.trim()
      if (!number) throw new AppError('Room number cannot be empty', 400)
      const clash = await Room.findOne({ number, _id: { $ne: room._id } })
      if (clash) throw new AppError('Room number already exists', 409)
      room.number = number
    }
    if (body.floor !== undefined) {
      const floor = Number(body.floor)
      if (!Number.isFinite(floor) || floor < 1) {
        throw new AppError('Floor must be a positive number', 400)
      }
      room.floor = floor
    }
    if (body.type !== undefined) {
      if (!isRoomType(body.type)) throw new AppError('Invalid room type', 400)
      room.type = body.type
    }
    if (body.status !== undefined) {
      if (!isRoomStatus(body.status)) {
        throw new AppError('Invalid room status', 400)
      }
      room.status = body.status
    }
    if (body.name !== undefined) room.name = body.name.trim() || room.name
    if (body.description !== undefined) {
      room.description = body.description.trim() || room.description
    }
    if (body.amenities !== undefined) {
      if (!Array.isArray(body.amenities)) {
        throw new AppError('amenities must be an array', 400)
      }
      room.amenities = body.amenities
        .map((a) => String(a).trim())
        .filter(Boolean)
    }
    if (body.capacity !== undefined) {
      const capacity = Number(body.capacity)
      if (!Number.isFinite(capacity) || capacity < 1) {
        throw new AppError('capacity must be at least 1', 400)
      }
      room.capacity = capacity
    }
    if (body.bedType !== undefined) {
      room.bedType = body.bedType.trim() || room.bedType
    }
    if (body.sizeSqm !== undefined) {
      const sizeSqm = Number(body.sizeSqm)
      if (!Number.isFinite(sizeSqm) || sizeSqm < 1) {
        throw new AppError('sizeSqm must be at least 1', 400)
      }
      room.sizeSqm = sizeSqm
    }
    if (body.ratePerNight !== undefined) {
      const ratePerNight = Number(body.ratePerNight)
      if (!Number.isFinite(ratePerNight) || ratePerNight < 0) {
        throw new AppError('ratePerNight must be a non-negative number', 400)
      }
      room.ratePerNight = roundMoney(ratePerNight)
    }
    if (body.imageUrl !== undefined) {
      room.imageUrl = body.imageUrl.trim() || room.imageUrl
    }
    if (body.note !== undefined) {
      room.note = body.note?.trim() ? body.note.trim() : undefined
    }

    await room.save()
    res.json(toRoomResponse(room))
  } catch (error) {
    next(error)
  }
}

export async function deleteAdminRoom(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseObjectId(paramId(req.params.id, 'room id'), 'room id')
    const room = await Room.findById(id)
    if (!room) throw new AppError('Room not found', 404)

    const active = await Reservation.countDocuments({
      roomId: id,
      status: { $in: ['reserved', 'checked_in'] },
    })
    if (active > 0) {
      throw new AppError(
        'Cannot delete a room with active reservations. Check out or cancel them first.',
        409,
      )
    }

    await room.deleteOne()
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}

export async function getAdminMenu(
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

export async function createAdminMenuItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await ensureMenuSeeded()
    const body = req.body as CreateAdminMenuItemInput
    if (!body.name?.trim()) throw new AppError('Name is required', 400)
    if (!isMenuCategory(body.category)) {
      throw new AppError('Invalid category', 400)
    }
    if (!Array.isArray(body.meals) || body.meals.length === 0) {
      throw new AppError('At least one meal period is required', 400)
    }
    if (!body.meals.every(isMenuMeal)) {
      throw new AppError('Invalid meal period', 400)
    }

    const price = Number(body.price)
    if (!Number.isFinite(price) || price < 0) {
      throw new AppError('price must be a non-negative number', 400)
    }

    const itemId = (body.id?.trim() || slugifyMenuId(body.name)).toLowerCase()
    if (!itemId) throw new AppError('Could not derive menu item id', 400)

    const existing = await MenuItem.findOne({ itemId })
    if (existing) throw new AppError('Menu item id already exists', 409)

    const item = await MenuItem.create({
      itemId,
      name: body.name.trim(),
      category: body.category,
      meals: body.meals,
      price: roundMoney(price),
      available: body.available !== false,
    })

    res.status(201).json(toMenuItemResponse(item))
  } catch (error) {
    next(error)
  }
}

export async function updateAdminMenuItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await ensureMenuSeeded()
    const itemId = paramId(req.params.id, 'menu item id')
    const item = await MenuItem.findOne({ itemId })
    if (!item) throw new AppError('Menu item not found', 404)

    const body = req.body as UpdateAdminMenuItemInput

    if (body.name !== undefined) {
      if (!body.name.trim()) throw new AppError('Name cannot be empty', 400)
      item.name = body.name.trim()
    }
    if (body.category !== undefined) {
      if (!isMenuCategory(body.category)) {
        throw new AppError('Invalid category', 400)
      }
      item.category = body.category
    }
    if (body.meals !== undefined) {
      if (!Array.isArray(body.meals) || body.meals.length === 0) {
        throw new AppError('At least one meal period is required', 400)
      }
      if (!body.meals.every(isMenuMeal)) {
        throw new AppError('Invalid meal period', 400)
      }
      item.meals = body.meals
    }
    if (body.price !== undefined) {
      const price = Number(body.price)
      if (!Number.isFinite(price) || price < 0) {
        throw new AppError('price must be a non-negative number', 400)
      }
      item.price = roundMoney(price)
    }
    if (body.available !== undefined) {
      item.available = Boolean(body.available)
    }

    await item.save()
    res.json(toMenuItemResponse(item))
  } catch (error) {
    next(error)
  }
}

export async function deleteAdminMenuItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const itemId = paramId(req.params.id, 'menu item id')
    const item = await MenuItem.findOneAndDelete({ itemId })
    if (!item) throw new AppError('Menu item not found', 404)
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}
