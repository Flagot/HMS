import type { PaymentStatus } from '../types/reservation.js'

export function countNights(checkIn: Date, checkOut: Date): number {
  const start = Date.UTC(
    checkIn.getUTCFullYear(),
    checkIn.getUTCMonth(),
    checkIn.getUTCDate(),
  )
  const end = Date.UTC(
    checkOut.getUTCFullYear(),
    checkOut.getUTCMonth(),
    checkOut.getUTCDate(),
  )
  const nights = Math.round((end - start) / (24 * 60 * 60 * 1000))
  return Math.max(1, nights)
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function derivePaymentStatus(
  totalAmount: number,
  amountPaid: number,
): PaymentStatus {
  if (amountPaid <= 0) return 'unpaid'
  if (amountPaid >= totalAmount) return 'paid'
  return 'partial'
}

export function staysIncludeDate(
  checkIn: Date,
  checkOut: Date,
  day: Date,
): boolean {
  const dayKey = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
  const inKey = Date.UTC(
    checkIn.getUTCFullYear(),
    checkIn.getUTCMonth(),
    checkIn.getUTCDate(),
  )
  const outKey = Date.UTC(
    checkOut.getUTCFullYear(),
    checkOut.getUTCMonth(),
    checkOut.getUTCDate(),
  )
  return dayKey >= inKey && dayKey < outKey
}
