export type RoomStatus = 'dirty' | 'in_progress' | 'clean' | 'inspect'

export type RoomType = 'standard' | 'deluxe' | 'suite'

export type RoomResponse = {
  id: string
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  name: string
  description: string
  amenities: string[]
  capacity: number
  bedType: string
  sizeSqm: number
  ratePerNight: number
  imageUrl: string
  note?: string
  updatedAt: string
}
