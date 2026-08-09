export type ReservationStatus =
  | 'reserved'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type RoomType = 'standard' | 'deluxe' | 'suite'

export type HousekeepingStatus = 'dirty' | 'in_progress' | 'clean' | 'inspect'

export type RoomOccupancy = 'vacant' | 'reserved' | 'occupied'

export type Reservation = {
  id: string
  confirmationCode: string
  guestName: string
  phone?: string
  email?: string
  roomType: RoomType
  roomId?: string
  roomNumber?: string
  checkInDate: string
  checkOutDate: string
  nights: number
  ratePerNight: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  paymentStatus: PaymentStatus
  adults: number
  status: ReservationStatus
  note?: string
  createdAt: string
  updatedAt: string
}

export type ReceptionRoom = {
  id: string
  number: string
  floor: number
  type: RoomType
  housekeepingStatus: HousekeepingStatus
  occupancy: RoomOccupancy
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

export type CreateReservationInput = {
  guestName: string
  phone?: string
  email?: string
  roomType: RoomType
  roomId?: string
  checkInDate: string
  checkOutDate: string
  adults: number
  note?: string
  amountPaid?: number
}

export type IncomeSummary = {
  date: string
  occupiedRooms: number
  occupiedFullyPaid: number
  occupiedUnpaidOrPartial: number
  totalBilled: number
  totalPaid: number
  totalBalanceDue: number
  todayNightValue: number
}
