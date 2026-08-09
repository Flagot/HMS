import type { Request, Response, NextFunction } from 'express'
import { Reservation } from '../models/Reservation.js'
import { Room } from '../models/Room.js'
import type { RoomType } from '../types/room.js'
import type { ReservationStatus } from '../types/reservation.js'
import {
  assertValidStayDates,
  findBlockingReservation,
  isRoomAssignableForCheckIn,
  nextConfirmationCode,
  startOfUtcDay,
} from '../utils/receptionHelpers.js'
import {
  countNights,
  derivePaymentStatus,
  roundMoney,
} from '../utils/payment.js'
import {
  buildStayIncomeSummary,
  loadRoomsWithOccupancy,
} from '../utils/managerOverview.js'
import { toReservationResponse } from '../utils/reservationMapper.js'
import { AppError } from '../middleware/errorHandler.js'

const validStatuses: ReservationStatus[] = [
  'reserved',
  'checked_in',
  'checked_out',
  'cancelled',
]
const validRoomTypes: RoomType[] = ['standard', 'deluxe', 'suite']

async function loadReservationRoomMap(roomIds: string[]) {
  if (roomIds.length === 0) return new Map()
  const rooms = await Room.find({ _id: { $in: roomIds } })
  return new Map(rooms.map((room) => [room._id.toString(), room]))
}

export async function getReservations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { status } = req.query
    const filter =
      typeof status === 'string' && validStatuses.includes(status as ReservationStatus)
        ? { status: status as ReservationStatus }
        : {}

    const reservations = await Reservation.find(filter).sort({ checkInDate: 1 })
    const roomMap = await loadReservationRoomMap(
      reservations
        .map((reservation) => reservation.roomId?.toString())
        .filter((id): id is string => Boolean(id)),
    )

    res.json(
      reservations.map((reservation) =>
        toReservationResponse(
          reservation,
          reservation.roomId
            ? roomMap.get(reservation.roomId.toString()) ?? null
            : null,
        ),
      ),
    )
  } catch (error) {
    next(error)
  }
}

export async function getReceptionRooms(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rooms = await loadRoomsWithOccupancy()
    res.json(rooms)
  } catch (error) {
    next(error)
  }
}

export async function getIncomeSummary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined
    const day = dateParam ? new Date(`${dateParam}T12:00:00.000Z`) : new Date()
    if (Number.isNaN(day.getTime())) {
      throw new AppError('Invalid date', 400)
    }

    res.json(await buildStayIncomeSummary(day))
  } catch (error) {
    next(error)
  }
}

export async function createReservation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      guestName,
      phone,
      email,
      roomType,
      roomId,
      checkInDate,
      checkOutDate,
      adults,
      note,
      amountPaid,
    } = req.body as {
      guestName?: string
      phone?: string
      email?: string
      roomType?: RoomType
      roomId?: string
      checkInDate?: string
      checkOutDate?: string
      adults?: number
      note?: string
      amountPaid?: number
    }

    if (!guestName?.trim()) {
      throw new AppError('Guest name is required', 400)
    }
    if (!roomType || !validRoomTypes.includes(roomType)) {
      throw new AppError('Invalid room type', 400)
    }

    const checkIn = new Date(checkInDate ?? '')
    const checkOut = new Date(checkOutDate ?? '')
    assertValidStayDates(checkIn, checkOut)
    if (startOfUtcDay(checkIn) < startOfUtcDay(new Date())) {
      throw new AppError('Check-in date cannot be in the past', 400)
    }

    const adultsCount = Number(adults ?? 1)
    if (!Number.isInteger(adultsCount) || adultsCount < 1) {
      throw new AppError('Adults must be at least 1', 400)
    }

    let assignedRoom = null
    if (roomId) {
      assignedRoom = await Room.findById(roomId)
      if (!assignedRoom) throw new AppError('Room not found', 404)
      if (assignedRoom.type !== roomType) {
        throw new AppError('Selected room does not match room type', 400)
      }
      const blocking = await findBlockingReservation(roomId, checkIn, checkOut)
      if (blocking) {
        throw new AppError('Room is not available for the selected dates', 400)
      }
    }

    const nights = countNights(checkIn, checkOut)
    const ratePerNight = roundMoney(assignedRoom?.ratePerNight ?? 0)
    const totalAmount = roundMoney(ratePerNight * nights)
    const paid = roundMoney(Number(amountPaid ?? 0))
    if (!Number.isFinite(paid) || paid < 0) {
      throw new AppError('amountPaid must be a non-negative number', 400)
    }
    if (paid > totalAmount) {
      throw new AppError('amountPaid cannot exceed total stay amount', 400)
    }

    const reservation = await Reservation.create({
      confirmationCode: await nextConfirmationCode(),
      guestName: guestName.trim(),
      phone: phone?.trim() || undefined,
      email: email?.trim() || undefined,
      roomType,
      roomId: assignedRoom?._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights,
      ratePerNight,
      totalAmount,
      amountPaid: paid,
      paymentStatus: derivePaymentStatus(totalAmount, paid),
      adults: adultsCount,
      note: note?.trim() || undefined,
      status: 'reserved',
    })

    res.status(201).json(toReservationResponse(reservation, assignedRoom))
  } catch (error) {
    next(error)
  }
}

export async function updatePayment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { amountPaid } = req.body as { amountPaid?: number }

    const reservation = await Reservation.findById(id)
    if (!reservation) throw new AppError('Reservation not found', 404)
    if (reservation.status === 'cancelled') {
      throw new AppError('Cannot update payment on a cancelled reservation', 400)
    }

    const paid = roundMoney(Number(amountPaid))
    if (!Number.isFinite(paid) || paid < 0) {
      throw new AppError('amountPaid must be a non-negative number', 400)
    }
    if (paid > reservation.totalAmount) {
      throw new AppError('amountPaid cannot exceed total stay amount', 400)
    }

    reservation.amountPaid = paid
    reservation.paymentStatus = derivePaymentStatus(reservation.totalAmount, paid)
    await reservation.save()

    const room = reservation.roomId
      ? await Room.findById(reservation.roomId)
      : null

    res.json(toReservationResponse(reservation, room))
  } catch (error) {
    next(error)
  }
}

export async function assignRoom(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { roomId } = req.body as { roomId?: string }

    if (!roomId) throw new AppError('roomId is required', 400)

    const reservation = await Reservation.findById(id)
    if (!reservation) throw new AppError('Reservation not found', 404)
    if (reservation.status !== 'reserved') {
      throw new AppError('Only reserved bookings can be reassigned', 400)
    }

    const room = await Room.findById(roomId)
    if (!room) throw new AppError('Room not found', 404)
    if (room.type !== reservation.roomType) {
      throw new AppError('Selected room does not match room type', 400)
    }

    const blocking = await findBlockingReservation(
      roomId,
      reservation.checkInDate,
      reservation.checkOutDate,
      String(id),
    )
    if (blocking) {
      throw new AppError('Room is not available for the selected dates', 400)
    }

    const nights =
      reservation.nights ||
      countNights(reservation.checkInDate, reservation.checkOutDate)
    const ratePerNight = roundMoney(room.ratePerNight ?? 0)
    const totalAmount = roundMoney(ratePerNight * nights)
    const amountPaid = roundMoney(
      Math.min(reservation.amountPaid ?? 0, totalAmount),
    )

    reservation.roomId = room._id
    reservation.nights = nights
    reservation.ratePerNight = ratePerNight
    reservation.totalAmount = totalAmount
    reservation.amountPaid = amountPaid
    reservation.paymentStatus = derivePaymentStatus(totalAmount, amountPaid)
    await reservation.save()
    res.json(toReservationResponse(reservation, room))
  } catch (error) {
    next(error)
  }
}

export async function checkInReservation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const { roomId } = req.body as { roomId?: string }

    const reservation = await Reservation.findById(id)
    if (!reservation) throw new AppError('Reservation not found', 404)
    if (reservation.status !== 'reserved') {
      throw new AppError('Only reserved bookings can be checked in', 400)
    }
    if (startOfUtcDay(reservation.checkInDate) > startOfUtcDay(new Date())) {
      throw new AppError(
        `Check-in starts ${reservation.checkInDate.toISOString().slice(0, 10)} — cannot check in earlier`,
        400,
      )
    }

    const targetRoomId = roomId || reservation.roomId?.toString()
    if (!targetRoomId) {
      throw new AppError('Assign a room before check-in', 400)
    }

    const room = await Room.findById(targetRoomId)
    if (!room) throw new AppError('Room not found', 404)
    if (room.type !== reservation.roomType) {
      throw new AppError('Selected room does not match room type', 400)
    }

    const blocking = await findBlockingReservation(
      targetRoomId,
      reservation.checkInDate,
      reservation.checkOutDate,
      String(id),
    )
    if (blocking) {
      throw new AppError('Room is not available for the selected dates', 400)
    }

    if (!isRoomAssignableForCheckIn(room)) {
      throw new AppError(
        `Room ${room.number} is not ready (housekeeping: ${room.status}). Wait for clean.`,
        400,
      )
    }

    reservation.roomId = room._id
    reservation.status = 'checked_in'
    room.note = `Occupied · ${reservation.guestName}`
    room.updatedAt = new Date()

    await Promise.all([reservation.save(), room.save()])
    res.json(toReservationResponse(reservation, room))
  } catch (error) {
    next(error)
  }
}

export async function checkOutReservation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params

    const reservation = await Reservation.findById(id)
    if (!reservation) throw new AppError('Reservation not found', 404)
    if (reservation.status !== 'checked_in') {
      throw new AppError('Only checked-in guests can be checked out', 400)
    }

    const room = reservation.roomId
      ? await Room.findById(reservation.roomId)
      : null

    reservation.status = 'checked_out'

    if (room) {
      room.status = 'dirty'
      room.note = `Guest checked out · ${reservation.guestName}`
      room.updatedAt = new Date()
      await Promise.all([reservation.save(), room.save()])
    } else {
      await reservation.save()
    }

    res.json(toReservationResponse(reservation, room))
  } catch (error) {
    next(error)
  }
}

export async function cancelReservation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params
    const reservation = await Reservation.findById(id)
    if (!reservation) throw new AppError('Reservation not found', 404)
    if (reservation.status !== 'reserved') {
      throw new AppError('Only reserved bookings can be cancelled', 400)
    }

    reservation.status = 'cancelled'
    await reservation.save()

    const room = reservation.roomId
      ? await Room.findById(reservation.roomId)
      : null

    res.json(toReservationResponse(reservation, room))
  } catch (error) {
    next(error)
  }
}
