import mongoose, { Schema, type Document } from 'mongoose'
import type { RoomStatus, RoomType } from '../types/room.js'

export interface IRoom extends Document {
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
    name: { type: String, trim: true, default: 'Guest Room' },
    description: {
      type: String,
      trim: true,
      default: 'Comfortable guest room with essential amenities.',
    },
    amenities: { type: [String], default: [] },
    capacity: { type: Number, min: 1, default: 2 },
    bedType: { type: String, trim: true, default: 'Queen' },
    sizeSqm: { type: Number, min: 1, default: 20 },
    ratePerNight: { type: Number, min: 0, default: 0 },
    imageUrl: {
      type: String,
      trim: true,
      default:
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    },
    note: { type: String, trim: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
)

roomSchema.index({ status: 1 })

export const Room = mongoose.model<IRoom>('Room', roomSchema)
