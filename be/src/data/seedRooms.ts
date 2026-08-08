import type { RoomStatus, RoomType } from '../types/room.js'

type SeedRoom = {
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  note?: string
  updatedAt: Date
}

export const seedRooms: SeedRoom[] = [
  { number: '101', floor: 1, type: 'standard', status: 'clean', updatedAt: new Date('2026-08-09T08:00:00') },
  { number: '102', floor: 1, type: 'standard', status: 'dirty', note: 'Guest checked out 10:30 AM', updatedAt: new Date('2026-08-09T10:30:00') },
  { number: '103', floor: 1, type: 'deluxe', status: 'in_progress', updatedAt: new Date('2026-08-09T11:00:00') },
  { number: '104', floor: 1, type: 'standard', status: 'dirty', updatedAt: new Date('2026-08-09T09:45:00') },
  { number: '201', floor: 2, type: 'deluxe', status: 'clean', updatedAt: new Date('2026-08-09T07:30:00') },
  { number: '202', floor: 2, type: 'deluxe', status: 'inspect', note: 'Maintenance flagged minibar', updatedAt: new Date('2026-08-09T10:00:00') },
  { number: '203', floor: 2, type: 'suite', status: 'dirty', note: 'Late checkout', updatedAt: new Date('2026-08-09T11:15:00') },
  { number: '204', floor: 2, type: 'standard', status: 'in_progress', updatedAt: new Date('2026-08-09T11:30:00') },
  { number: '301', floor: 3, type: 'suite', status: 'clean', updatedAt: new Date('2026-08-09T08:45:00') },
  { number: '302', floor: 3, type: 'suite', status: 'dirty', updatedAt: new Date('2026-08-09T10:00:00') },
  { number: '303', floor: 3, type: 'deluxe', status: 'clean', updatedAt: new Date('2026-08-09T09:00:00') },
  { number: '304', floor: 3, type: 'standard', status: 'dirty', updatedAt: new Date('2026-08-09T11:45:00') },
]
