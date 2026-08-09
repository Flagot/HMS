import type { IReservation } from '../models/Reservation.js'
import type { IRoom } from '../models/Room.js'
import type {
  ReceptionRoomResponse,
  ReservationResponse,
} from '../types/reservation.js'
import { derivePaymentStatus, roundMoney } from './payment.js'

export function toReservationResponse(
  reservation: IReservation,
  room?: IRoom | null,
): ReservationResponse {
  const totalAmount = roundMoney(reservation.totalAmount ?? 0)
  const amountPaid = roundMoney(reservation.amountPaid ?? 0)
  const balanceDue = roundMoney(Math.max(0, totalAmount - amountPaid))
  const paymentStatus =
    reservation.paymentStatus || derivePaymentStatus(totalAmount, amountPaid)

  return {
    id: reservation._id.toString(),
    confirmationCode: reservation.confirmationCode,
    guestName: reservation.guestName,
    phone: reservation.phone,
    email: reservation.email,
    roomType: reservation.roomType,
    roomId: reservation.roomId?.toString(),
    roomNumber: room?.number,
    checkInDate: reservation.checkInDate.toISOString(),
    checkOutDate: reservation.checkOutDate.toISOString(),
    nights: reservation.nights || 1,
    ratePerNight: roundMoney(reservation.ratePerNight ?? room?.ratePerNight ?? 0),
    totalAmount,
    amountPaid,
    balanceDue,
    paymentStatus,
    adults: reservation.adults,
    status: reservation.status,
    note: reservation.note,
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
  }
}

export function toReceptionRoomResponse(
  room: IRoom,
  occupancy: ReceptionRoomResponse['occupancy'],
): ReceptionRoomResponse {
  return {
    id: room._id.toString(),
    number: room.number,
    floor: room.floor,
    type: room.type,
    housekeepingStatus: room.status,
    occupancy,
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
