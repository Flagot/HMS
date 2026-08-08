import type { Room, RoomStatus } from '../types/room'
import { apiFetch } from './client'

export function fetchRooms(): Promise<Room[]> {
  return apiFetch<Room[]>('/api/housekeeping/rooms')
}

export function updateRoomStatus(
  roomId: string,
  status: RoomStatus,
): Promise<Room> {
  return apiFetch<Room>(`/api/housekeeping/rooms/${roomId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
