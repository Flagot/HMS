import mongoose, { Schema, type Document, type Types } from 'mongoose'
import type { RoomType } from '../types/room.js'
import type { PaymentStatus, ReservationStatus } from '../types/reservation.js'

export interface IReservation extends Document {
  confirmationCode: string
  guestName: string
  phone?: string
  email?: string
  roomType: RoomType
  roomId?: Types.ObjectId
  checkInDate: Date
  checkOutDate: Date
  nights: number
  ratePerNight: number
  totalAmount: number
  amountPaid: number
  paymentStatus: PaymentStatus
  adults: number
  status: ReservationStatus
  note?: string
  createdAt: Date
  updatedAt: Date
}

const reservationSchema = new Schema<IReservation>(
  {
    confirmationCode: { type: String, required: true, unique: true, trim: true },
    guestName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    roomType: {
      type: String,
      required: true,
      enum: ['standard', 'deluxe', 'suite'],
    },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1, default: 1 },
    ratePerNight: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0, default: 0 },
    amountPaid: { type: Number, required: true, min: 0, default: 0 },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    adults: { type: Number, required: true, min: 1, default: 1 },
    status: {
      type: String,
      required: true,
      enum: ['reserved', 'checked_in', 'checked_out', 'cancelled'],
      default: 'reserved',
    },
    note: { type: String, trim: true },
  },
  { timestamps: true },
)

reservationSchema.index({ status: 1 })
reservationSchema.index({ roomId: 1, status: 1 })
reservationSchema.index({ checkInDate: 1 })
reservationSchema.index({ paymentStatus: 1 })

export const Reservation = mongoose.model<IReservation>(
  'Reservation',
  reservationSchema,
)
