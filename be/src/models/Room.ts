import mongoose, { Schema, type Document } from 'mongoose'
import type { RoomStatus, RoomType } from '../types/room.js'

export interface IRoom extends Document {
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  note?: string
  updatedAt: Date
}

const roomSchema = new Schema<IRoom>(
  {
    number: { type: String, required: true, unique: true, trim: true },
    floor: { type: Number, required: true, min: 1 },
    type: {
      type: String,
      required: true,
      enum: ['standard', 'deluxe', 'suite'],
    },
    status: {
      type: String,
      required: true,
      enum: ['dirty', 'in_progress', 'clean', 'inspect'],
      default: 'dirty',
    },
    note: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
)

roomSchema.index({ status: 1 })

export const Room = mongoose.model<IRoom>('Room', roomSchema)
