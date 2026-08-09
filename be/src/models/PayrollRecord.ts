import mongoose, { Schema, type Document } from 'mongoose'

/**
 * One record per employee per month, created when the admin marks the
 * salary as paid. Absence of a record means the month is unpaid.
 */
export interface IPayrollRecord extends Document {
  userId: string
  username: string
  name: string
  role: string
  month: string // 'YYYY-MM'
  amount: number
  paidOn: Date
  paidBy?: string
  note?: string
  expenseId?: string
  createdAt: Date
  updatedAt: Date
}

const payrollRecordSchema = new Schema<IPayrollRecord>(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paidOn: { type: Date, required: true },
    paidBy: { type: String },
    note: { type: String, trim: true },
    expenseId: { type: String },
  },
  { timestamps: true },
)

payrollRecordSchema.index({ userId: 1, month: 1 }, { unique: true })

export const PayrollRecord = mongoose.model<IPayrollRecord>(
  'PayrollRecord',
  payrollRecordSchema,
)
