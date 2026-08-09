import mongoose, { Schema, type Document } from 'mongoose'

export type PasswordResetStatus = 'pending' | 'resolved' | 'dismissed'

export interface IPasswordResetRequest extends Document {
  userId: string
  username: string
  name: string
  role: string
  status: PasswordResetStatus
  resolvedAt?: Date
  resolvedBy?: string
  createdAt: Date
  updatedAt: Date
}

const passwordResetRequestSchema = new Schema<IPasswordResetRequest>(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
  },
  { timestamps: true },
)

passwordResetRequestSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
)

export const PasswordResetRequest = mongoose.model<IPasswordResetRequest>(
  'PasswordResetRequest',
  passwordResetRequestSchema,
)

export type PasswordResetRequestDto = {
  id: string
  userId: string
  username: string
  name: string
  role: string
  status: PasswordResetStatus
  createdAt: string
  resolvedAt?: string
}
