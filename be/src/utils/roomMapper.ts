import type { IRoom } from '../models/Room.js'
import type { RoomResponse } from '../types/room.js'

export function toRoomResponse(room: IRoom): RoomResponse {
  return {
    id: room._id.toString(),
    number: room.number,
    floor: room.floor,
    type: room.type,
    status: room.status,
    note: room.note,
    updatedAt: room.updatedAt.toISOString(),
  }
}
