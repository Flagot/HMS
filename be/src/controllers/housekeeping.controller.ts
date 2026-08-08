import type { Request, Response, NextFunction } from 'express'
import { Room } from '../models/Room.js'
import type { RoomStatus } from '../types/room.js'
import { isValidStatusTransition } from '../utils/statusTransitions.js'
import { toRoomResponse } from '../utils/roomMapper.js'
import { AppError } from '../middleware/errorHandler.js'

const validStatuses: RoomStatus[] = ['dirty', 'in_progress', 'clean', 'inspect']

export async function getRooms(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { status } = req.query
    const filter =
      typeof status === 'string' && validStatuses.includes(status as RoomStatus)
        ? { status: status as RoomStatus }
        : {}

    const rooms = await Room.find(filter).sort({ number: 1 })
    res.json(rooms.map(toRoomResponse))
  } catch (error) {
    next(error)
  }
}

export async function updateRoomStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { status } = req.body as { status?: RoomStatus }

    if (!status || !validStatuses.includes(status)) {
      throw new AppError('Invalid status value', 400)
    }

    const room = await Room.findById(id)
    if (!room) {
      throw new AppError('Room not found', 404)
    }

    if (!isValidStatusTransition(room.status, status)) {
      throw new AppError(
        `Cannot change status from "${room.status}" to "${status}"`,
        400,
      )
    }

    room.status = status
    if (status === 'in_progress' || status === 'clean') {
      room.note = undefined
    }
    room.updatedAt = new Date()

    await room.save()
    res.json(toRoomResponse(room))
  } catch (error) {
    next(error)
  }
}
