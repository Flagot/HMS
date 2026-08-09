import mongoose, { Schema, type Document } from 'mongoose'

export interface IHotelSettings extends Document {
  hotelName: string
  createdAt: Date
  updatedAt: Date
}

const hotelSettingsSchema = new Schema<IHotelSettings>(
  {
    hotelName: { type: String, required: true, trim: true, default: 'GrandStay' },
  },
  { timestamps: true },
)

export const HotelSettings = mongoose.model<IHotelSettings>(
  'HotelSettings',
  hotelSettingsSchema,
)
