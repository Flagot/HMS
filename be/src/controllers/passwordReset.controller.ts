import type { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth, authDb } from '../auth/auth.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import {
  PasswordResetRequest,
  type PasswordResetRequestDto,
} from '../models/PasswordResetRequest.js'

function toDto(doc: {
  _id: { toString(): string }
  userId: string
  username: string
  name: string
  role: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: Date
  resolvedAt?: Date
}): PasswordResetRequestDto {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    username: doc.username,
    name: doc.name,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
    ...(doc.resolvedAt
      ? { resolvedAt: doc.resolvedAt.toISOString() }
      : {}),
  }
}

/** Public: staff asks admin to reset their password. */
export async function createPasswordResetRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const usernameRaw =
      typeof req.body?.username === 'string' ? req.body.username.trim() : ''

    if (usernameRaw.length < 3) {
      throw new AppError('Username is required', 400)
    }

    const normalized = usernameRaw.toLowerCase()
    const user = await authDb.collection('user').findOne({
      $or: [{ username: normalized }, { username: usernameRaw }],
    })

    // Always return the same message so usernames cannot be enumerated.
    if (!user) {
      res.status(201).json({
        message:
          'If that username exists, an administrator has been notified.',
      })
      return
    }

    const existing = await PasswordResetRequest.findOne({
      userId: String(user._id ?? user.id),
      status: 'pending',
    })

    if (existing) {
      existing.createdAt = new Date()
      await existing.save()
      res.status(201).json({
        message:
          'If that username exists, an administrator has been notified.',
      })
      return
    }

    try {
      await PasswordResetRequest.create({
        userId: String(user.id ?? user._id),
        username: String(user.username ?? normalized),
        name: String(user.name ?? user.username ?? normalized),
        role: String(user.role ?? 'staff'),
        status: 'pending',
      })
    } catch {
      // Likely a concurrent duplicate pending request — treat as success.
    }

    res.status(201).json({
      message:
        'If that username exists, an administrator has been notified.',
    })
  } catch (error) {
    next(error)
  }
}

export async function listPasswordResetRequests(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status =
      typeof req.query.status === 'string' ? req.query.status : 'pending'

    const query = PasswordResetRequest.find()
      .sort({ createdAt: -1 })
      .limit(100)
    if (status !== 'all') {
      query
        .where('status')
        .equals(
          status === 'resolved' || status === 'dismissed' ? status : 'pending',
        )
    }
    const docs = await query.lean()

    res.json({
      requests: docs.map((doc) => toDto(doc as Parameters<typeof toDto>[0])),
      pendingCount: await PasswordResetRequest.countDocuments({
        status: 'pending',
      }),
    })
  } catch (error) {
    next(error)
  }
}

export async function getPasswordResetPendingCount(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const pendingCount = await PasswordResetRequest.countDocuments({
      status: 'pending',
    })
    res.json({ pendingCount })
  } catch (error) {
    next(error)
  }
}

export async function resolvePasswordResetRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = String(req.params.id ?? '')
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword : ''

    if (!id) throw new AppError('Request id is required', 400)
    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400)
    }

    const doc = await PasswordResetRequest.findById(id)
    if (!doc) throw new AppError('Reset request not found', 404)
    if (doc.status !== 'pending') {
      throw new AppError('This request was already handled', 400)
    }

    try {
      await auth.api.setUserPassword({
        body: {
          userId: doc.userId,
          newPassword,
        },
        headers: fromNodeHeaders(req.headers),
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not update password'
      throw new AppError(message, 400)
    }
    const admin = (req as AuthedRequest).sessionUser
    doc.status = 'resolved'
    doc.resolvedAt = new Date()
    doc.resolvedBy = admin?.id
    await doc.save()

    res.json({
      message: `Password updated for ${doc.username}`,
      request: toDto(doc),
    })
  } catch (error) {
    next(error)
  }
}

export async function dismissPasswordResetRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = String(req.params.id ?? '')
    if (!id) throw new AppError('Request id is required', 400)

    const doc = await PasswordResetRequest.findById(id)
    if (!doc) throw new AppError('Reset request not found', 404)
    if (doc.status !== 'pending') {
      throw new AppError('This request was already handled', 400)
    }

    const admin = (req as AuthedRequest).sessionUser
    doc.status = 'dismissed'
    doc.resolvedAt = new Date()
    doc.resolvedBy = admin?.id
    await doc.save()

    res.json({
      message: `Dismissed reset request for ${doc.username}`,
      request: toDto(doc),
    })
  } catch (error) {
    next(error)
  }
}
