export type RoomStatus = 'dirty' | 'in_progress' | 'clean' | 'inspect'

export type RoomType = 'standard' | 'deluxe' | 'suite'

export type RoomResponse = {
  id: string
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  note?: string
  updatedAt: string
}
