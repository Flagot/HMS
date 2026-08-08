import type { RoomStatus } from '../types/room.js'

const allowedTransitions: Record<RoomStatus, RoomStatus[]> = {
  dirty: ['in_progress'],
  inspect: ['in_progress'],
  in_progress: ['clean'],
  clean: [],
}

export function isValidStatusTransition(
  current: RoomStatus,
  next: RoomStatus,
): boolean {
  return allowedTransitions[current].includes(next)
}
