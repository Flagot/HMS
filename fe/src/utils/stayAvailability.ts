import type { ReceptionRoom, Reservation } from '../types/reservation'

/** Normalize to YYYY-MM-DD for date-only hotel stay comparisons. */
export function toStayDateKey(value: string | Date): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toISOString().slice(0, 10)
}

/**
 * Hotel stays: checkout day frees the room for a same-day check-in.
 * Ranges overlap when newCheckIn < existingCheckOut AND newCheckOut > existingCheckIn.
 */
export function staysOverlap(
  checkInA: string,
  checkOutA: string,
  checkInB: string,
  checkOutB: string,
): boolean {
  const aIn = toStayDateKey(checkInA)
  const aOut = toStayDateKey(checkOutA)
  const bIn = toStayDateKey(checkInB)
  const bOut = toStayDateKey(checkOutB)
  return aIn < bOut && aOut > bIn
}

export function isRoomFreeForDates(
  roomId: string,
  reservations: Reservation[],
  checkInDate: string,
  checkOutDate: string,
): boolean {
  if (!checkInDate || !checkOutDate) return true
  if (toStayDateKey(checkOutDate) <= toStayDateKey(checkInDate)) return false

  return !reservations.some(
    (reservation) =>
      reservation.roomId === roomId &&
      (reservation.status === 'reserved' || reservation.status === 'checked_in') &&
      staysOverlap(
        reservation.checkInDate,
        reservation.checkOutDate,
        checkInDate,
        checkOutDate,
      ),
  )
}

export type StayDueStatus = 'ok' | 'due_today' | 'overstay'

/** Due-out state of a checked-in stay compared to today's calendar date. */
export function stayDueStatus(
  reservation: Reservation,
  today: Date = new Date(),
): StayDueStatus {
  if (reservation.status !== 'checked_in') return 'ok'
  const outKey = toStayDateKey(reservation.checkOutDate)
  const todayKey = toStayDateKey(today)
  if (outKey < todayKey) return 'overstay'
  if (outKey === todayKey) return 'due_today'
  return 'ok'
}

/** Whole nights past the scheduled checkout date. */
export function overstayNights(
  reservation: Reservation,
  today: Date = new Date(),
): number {
  const out = new Date(`${toStayDateKey(reservation.checkOutDate)}T00:00:00Z`)
  const now = new Date(`${toStayDateKey(today)}T00:00:00Z`)
  const nights = Math.round(
    (now.getTime() - out.getTime()) / (24 * 60 * 60 * 1000),
  )
  return Math.max(0, nights)
}

/**
 * A room can be reserved whenever it is free for the requested dates.
 * Housekeeping status only matters at check-in time (enforced server-side).
 */
export function canReserveRoom(
  room: ReceptionRoom,
  reservations: Reservation[],
  checkInDate?: string,
  checkOutDate?: string,
): boolean {
  if (checkInDate && checkOutDate) {
    return isRoomFreeForDates(room.id, reservations, checkInDate, checkOutDate)
  }

  return room.occupancy === 'vacant'
}
