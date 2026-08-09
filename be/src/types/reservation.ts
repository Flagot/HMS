export type ReservationStatus =
  | 'reserved'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type ReservationResponse = {
  id: string
  confirmationCode: string
  guestName: string
  phone?: string
  email?: string
  roomType: 'standard' | 'deluxe' | 'suite'
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

export type ReceptionRoomResponse = {
  id: string
  number: string
  floor: number
  type: 'standard' | 'deluxe' | 'suite'
  housekeepingStatus: 'dirty' | 'in_progress' | 'clean' | 'inspect'
  occupancy: 'vacant' | 'reserved' | 'occupied'
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

export type IncomeSummaryResponse = {
  date: string
  occupiedRooms: number
  occupiedFullyPaid: number
  occupiedUnpaidOrPartial: number
  totalBilled: number
  totalPaid: number
  totalBalanceDue: number
  todayNightValue: number
}
