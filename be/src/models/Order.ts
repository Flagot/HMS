import mongoose, { Schema, type Document } from 'mongoose'
import type { OrderLine, OrderStatus, OrderType } from '../types/order.js'

export interface IOrder extends Document {
  orderNumber: string
  type: OrderType
  location: string
  items: OrderLine[]
  subtotal: number
  tax: number
  serviceCharge: number
  total: number
  taxRate: number
  serviceChargeRate: number
  status: OrderStatus
  note?: string
  createdAt: Date
  updatedAt: Date
}

const orderLineSchema = new Schema<OrderLine>(
  {
    menuItemId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['table', 'room_service'],
    },
    location: { type: String, required: true, trim: true },
    items: {
      type: [orderLineSchema],
      required: true,
      validate: {
        validator: (value: OrderLine[]) => Array.isArray(value) && value.length > 0,
        message: 'Order must include at least one item',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    serviceCharge: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, min: 0 },
    serviceChargeRate: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'preparing', 'ready', 'served'],
      default: 'pending',
    },
    note: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
)

orderSchema.index({ status: 1 })
orderSchema.index({ type: 1 })

export const Order = mongoose.model<IOrder>('Order', orderSchema)
