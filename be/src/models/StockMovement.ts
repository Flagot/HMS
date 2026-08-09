import mongoose, { Schema, type Document, type Types } from 'mongoose'
import {
  STOCK_MOVEMENT_TYPES,
  STORE_DEPARTMENTS,
  type StockMovementType,
  type StoreDepartment,
} from '../types/store.js'

export interface IStockMovement extends Document {
  item: Types.ObjectId
  type: StockMovementType
  quantity: number
  balanceAfter: number
  department?: StoreDepartment
  note?: string
  createdAt: Date
  updatedAt: Date
}

const stockMovementSchema = new Schema<IStockMovement>(
  {
    item: { type: Schema.Types.ObjectId, ref: 'StoreItem', required: true },
    type: {
      type: String,
      required: true,
      enum: STOCK_MOVEMENT_TYPES,
    },
    quantity: { type: Number, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    department: {
      type: String,
      enum: STORE_DEPARTMENTS,
    },
    note: { type: String, trim: true },
  },
  { timestamps: true },
)

stockMovementSchema.index({ createdAt: -1 })
stockMovementSchema.index({ item: 1, createdAt: -1 })
stockMovementSchema.index({ type: 1, createdAt: -1 })

export const StockMovement = mongoose.model<IStockMovement>(
  'StockMovement',
  stockMovementSchema,
)
