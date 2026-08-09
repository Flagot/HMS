import mongoose, { Schema, type Document } from 'mongoose'
import type { MenuCategory, MenuMeal } from '../data/menuCatalog.js'

export interface IMenuItem extends Document {
  itemId: string
  name: string
  category: MenuCategory
  meals: MenuMeal[]
  price: number
  available: boolean
  updatedAt: Date
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    itemId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['drinks', 'food', 'sides', 'dessert'],
    },
    meals: {
      type: [String],
      required: true,
      enum: ['breakfast', 'lunch', 'dinner'],
    },
    price: { type: Number, required: true, min: 0 },
    available: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  },
)

menuItemSchema.index({ category: 1 })
menuItemSchema.index({ available: 1 })

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema)
