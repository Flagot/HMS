import mongoose, { Schema, type Document } from 'mongoose'
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from '../types/expense.js'

export interface IExpense extends Document {
  title: string
  category: ExpenseCategory
  amount: number
  spentOn: Date
  note?: string
  createdAt: Date
  updatedAt: Date
}

const expenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: EXPENSE_CATEGORIES,
    },
    amount: { type: Number, required: true, min: 0 },
    spentOn: { type: Date, required: true },
    note: { type: String, trim: true },
  },
  { timestamps: true },
)

expenseSchema.index({ spentOn: 1 })
expenseSchema.index({ category: 1 })

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema)
