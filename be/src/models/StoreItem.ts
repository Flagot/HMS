import mongoose, { Schema, type Document } from 'mongoose'
import {
  STORE_CATEGORIES,
  STORE_UNITS,
  type StoreCategory,
  type StoreUnit,
} from '../types/store.js'

export interface IStoreItem extends Document {
  name: string
  sku: string
  category: StoreCategory
  unit: StoreUnit
  quantityOnHand: number
  reorderLevel: number
  unitCost: number
  note?: string
  createdAt: Date
  updatedAt: Date
}

const storeItemSchema = new Schema<IStoreItem>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    category: {
      type: String,
      required: true,
      enum: STORE_CATEGORIES,
    },
    unit: {
      type: String,
      required: true,
      enum: STORE_UNITS,
    },
    quantityOnHand: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, required: true, min: 0, default: 0 },
    unitCost: { type: Number, required: true, min: 0, default: 0 },
    note: { type: String, trim: true },
  },
  { timestamps: true },
)

storeItemSchema.index({ sku: 1 }, { unique: true })
storeItemSchema.index({ category: 1 })
storeItemSchema.index({ name: 1 })

export const StoreItem = mongoose.model<IStoreItem>('StoreItem', storeItemSchema)
