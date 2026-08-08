import type { Room } from '../types/room'

export const initialRooms: Room[] = [
  { id: '101', number: '101', floor: 1, type: 'standard', status: 'clean', updatedAt: '2026-08-09T08:00:00' },
  { id: '102', number: '102', floor: 1, type: 'standard', status: 'dirty', note: 'Guest checked out 10:30 AM', updatedAt: '2026-08-09T10:30:00' },
  { id: '103', number: '103', floor: 1, type: 'deluxe', status: 'in_progress', updatedAt: '2026-08-09T11:00:00' },
  { id: '104', number: '104', floor: 1, type: 'standard', status: 'dirty', updatedAt: '2026-08-09T09:45:00' },
  { id: '201', number: '201', floor: 2, type: 'deluxe', status: 'clean', updatedAt: '2026-08-09T07:30:00' },
  { id: '202', number: '202', floor: 2, type: 'deluxe', status: 'inspect', note: 'Maintenance flagged minibar', updatedAt: '2026-08-09T10:00:00' },
  { id: '203', number: '203', floor: 2, type: 'suite', status: 'dirty', note: 'Late checkout', updatedAt: '2026-08-09T11:15:00' },
  { id: '204', number: '204', floor: 2, type: 'standard', status: 'in_progress', updatedAt: '2026-08-09T11:30:00' },
  { id: '301', number: '301', floor: 3, type: 'suite', status: 'clean', updatedAt: '2026-08-09T08:45:00' },
  { id: '302', number: '302', floor: 3, type: 'suite', status: 'dirty', updatedAt: '2026-08-09T10:00:00' },
  { id: '303', number: '303', floor: 3, type: 'deluxe', status: 'clean', updatedAt: '2026-08-09T09:00:00' },
  { id: '304', number: '304', floor: 3, type: 'standard', status: 'dirty', updatedAt: '2026-08-09T11:45:00' },
]
