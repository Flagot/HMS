import { Reservation } from '../models/Reservation.js'
import type { IRoom } from '../models/Room.js'
import { AppError } from '../middleware/errorHandler.js'

export async function nextConfirmationCode(): Promise<string> {
  const latest = await Reservation.findOne()
    .sort({ confirmationCode: -1 })
    .select('confirmationCode')

  if (!latest?.confirmationCode) {
    return 'R-1001'
  }

  const match = /^R-(\d+)$/.exec(latest.confirmationCode)
  const next = match ? Number(match[1]) + 1 : Date.now() % 100000
  return `R-${String(next).padStart(4, '0')}`
}

export function assertValidStayDates(checkIn: Date, checkOut: Date): void {
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    throw new AppError('Invalid check-in or check-out date', 400)
  }
  if (checkOut <= checkIn) {
    throw new AppError('Check-out must be after check-in', 400)
  }
}

export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
}

/**
 * Active reservation that overlaps the requested stay on this room.
 * Comparison is at calendar-day granularity so stored clock times never
 * matter: the checkout day stays available for a new same-day check-in.
 */
export async function findBlockingReservation(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeId?: string,
) {
  const checkOutDayStart = startOfUtcDay(checkOut)
  const dayAfterCheckIn = new Date(
    startOfUtcDay(checkIn).getTime() + 24 * 60 * 60 * 1000,
  )

  const filter: Record<string, unknown> = {
    roomId,
    status: { $in: ['reserved', 'checked_in'] },
    // Existing check-in day is before the requested checkout day…
    checkInDate: { $lt: checkOutDayStart },
    // …and existing checkout day is after the requested check-in day.
    checkOutDate: { $gte: dayAfterCheckIn },
  }
  if (excludeId) {
    filter._id = { $ne: excludeId }
  }
  return Reservation.findOne(filter)
}

export function isRoomAssignableForCheckIn(room: IRoom): boolean {
  return room.status === 'clean'
}
