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

/**
 * Active reservation that overlaps the requested stay on this room.
 * Checkout day is available for a new same-day check-in.
 */
export async function findBlockingReservation(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeId?: string,
) {
  const filter: Record<string, unknown> = {
    roomId,
    status: { $in: ['reserved', 'checked_in'] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  }
  if (excludeId) {
    filter._id = { $ne: excludeId }
  }
  return Reservation.findOne(filter)
}

export function isRoomAssignableForCheckIn(room: IRoom): boolean {
  return room.status === 'clean'
}
