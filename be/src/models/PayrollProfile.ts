import mongoose, { Schema, type Document } from 'mongoose'

/** Per-employee payroll settings: monthly salary and the day of month it is due. */
export interface IPayrollProfile extends Document {
  userId: string
  salary: number
  payDay: number
  createdAt: Date
  updatedAt: Date
}

const payrollProfileSchema = new Schema<IPayrollProfile>(
  {
    userId: { type: String, required: true, unique: true },
    salary: { type: Number, required: true, min: 0 },
    payDay: { type: Number, required: true, min: 1, max: 31 },
  },
  { timestamps: true },
)

export const PayrollProfile = mongoose.model<IPayrollProfile>(
  'PayrollProfile',
  payrollProfileSchema,
)
