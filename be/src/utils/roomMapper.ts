import type { IRoom } from '../models/Room.js'
import type { RoomResponse } from '../types/room.js'

export function toRoomResponse(room: IRoom): RoomResponse {
  return {
    id: room._id.toString(),
    number: room.number,
    floor: room.floor,
    type: room.type,
    status: room.status,
    name: room.name || `Room ${room.number}`,
    description: room.description || 'Room details coming soon.',
    amenities: room.amenities ?? [],
    capacity: room.capacity || 2,
    bedType: room.bedType || 'Queen',
    sizeSqm: room.sizeSqm || 20,
    ratePerNight: room.ratePerNight || 0,
    imageUrl:
      room.imageUrl ||
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    note: room.note,
    updatedAt: room.updatedAt.toISOString(),
  }
}
