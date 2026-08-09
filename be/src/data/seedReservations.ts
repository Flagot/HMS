import type { PaymentStatus, ReservationStatus } from '../types/reservation.js'
import type { RoomType } from '../types/room.js'

type SeedReservation = {
  confirmationCode: string
  guestName: string
  phone?: string
  email?: string
  roomType: RoomType
  roomNumber?: string
  checkInDate: Date
  checkOutDate: Date
  adults: number
  status: ReservationStatus
  /** Fraction of total paid: 0 unpaid, 1 fully paid, or partial (e.g. 0.5). */
  paidRatio: number
  note?: string
  createdAt: Date
  updatedAt: Date
}

export const seedReservations: SeedReservation[] = [
  {
    confirmationCode: 'R-1001',
    guestName: 'Amina Bekele',
    phone: '+251911000111',
    roomType: 'deluxe',
    roomNumber: '201',
    checkInDate: new Date('2026-08-09T14:00:00'),
    checkOutDate: new Date('2026-08-11T11:00:00'),
    adults: 2,
    status: 'checked_in',
    paidRatio: 1,
    createdAt: new Date('2026-08-08T09:00:00'),
    updatedAt: new Date('2026-08-09T14:10:00'),
  },
  {
    confirmationCode: 'R-1002',
    guestName: 'Daniel Tesfaye',
    phone: '+251922000222',
    email: 'daniel@example.com',
    roomType: 'standard',
    roomNumber: '101',
    checkInDate: new Date('2026-08-10T15:00:00'),
    checkOutDate: new Date('2026-08-12T11:00:00'),
    adults: 1,
    status: 'reserved',
    paidRatio: 0.5,
    note: 'Late arrival ~9 PM',
    createdAt: new Date('2026-08-08T12:00:00'),
    updatedAt: new Date('2026-08-08T12:00:00'),
  },
  {
    confirmationCode: 'R-1003',
    guestName: 'Sara Hailu',
    roomType: 'suite',
    checkInDate: new Date('2026-08-11T14:00:00'),
    checkOutDate: new Date('2026-08-14T11:00:00'),
    adults: 2,
    status: 'reserved',
    paidRatio: 0,
    createdAt: new Date('2026-08-09T08:00:00'),
    updatedAt: new Date('2026-08-09T08:00:00'),
  },
  {
    confirmationCode: 'R-1004',
    guestName: 'Yohannes Alemu',
    phone: '+251933000333',
    roomType: 'standard',
    roomNumber: '104',
    checkInDate: new Date('2026-08-07T14:00:00'),
    checkOutDate: new Date('2026-08-09T11:00:00'),
    adults: 1,
    status: 'checked_out',
    paidRatio: 1,
    createdAt: new Date('2026-08-06T10:00:00'),
    updatedAt: new Date('2026-08-09T11:05:00'),
  },
  {
    confirmationCode: 'R-1005',
    guestName: 'Helen Girma',
    phone: '+251944000444',
    roomType: 'suite',
    roomNumber: '301',
    checkInDate: new Date('2026-08-08T14:00:00'),
    checkOutDate: new Date('2026-08-12T11:00:00'),
    adults: 2,
    status: 'checked_in',
    paidRatio: 0,
    note: 'Pay at checkout',
    createdAt: new Date('2026-08-07T16:00:00'),
    updatedAt: new Date('2026-08-08T14:20:00'),
  },
]

export type { PaymentStatus }
