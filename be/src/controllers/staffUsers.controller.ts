import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { ObjectId } from 'mongodb'
import { auth, authDb } from '../auth/auth.js'
import { AppError } from '../middleware/errorHandler.js'

function toPlaceholderEmail(usernameValue: string): string {
  const local = usernameValue
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 48)
  return `${local || 'user'}@noemail.local`
}

function userIdFilter(userId: string) {
  const filters: Record<string, unknown>[] = [{ id: userId }]
  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) })
  }
  return { $or: filters }
}

function toStaffUserDto(user: Record<string, unknown>) {
  const email = typeof user.email === 'string' ? user.email : ''
  return {
    id: String(user.id ?? user._id),
    name: String(user.name ?? ''),
    email,
    username: typeof user.username === 'string' ? user.username : null,
    phone: typeof user.phone === 'string' ? user.phone : null,
    role: typeof user.role === 'string' ? user.role : null,
    banned: Boolean(user.banned),
    createdAt: user.createdAt,
  }
}

export async function updateStaffUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = String(req.params.id ?? '')
    if (!userId) throw new AppError('User id is required', 400)

    const body = req.body as {
      name?: string
      username?: string
      email?: string
      phone?: string
      newPassword?: string
    }

    const existing = await authDb.collection('user').findOne(userIdFilter(userId))
    if (!existing) throw new AppError('User not found', 404)

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) {
      const name = body.name.trim()
      updates.name = name || String(existing.username ?? existing.name ?? 'Staff')
    }

    if (body.username !== undefined) {
      const usernameRaw = body.username.trim()
      if (usernameRaw.length < 3) {
        throw new AppError('Username must be at least 3 characters', 400)
      }
      if (usernameRaw.length > 30) {
        throw new AppError('Username must be at most 30 characters', 400)
      }

      const username = usernameRaw.toLowerCase()
      const taken = await authDb.collection('user').findOne({
        $or: [{ username }, { username: usernameRaw }],
      })
      if (taken && String(taken.id ?? taken._id) !== String(existing.id ?? existing._id)) {
        throw new AppError('Username is already taken', 400)
      }

      updates.username = username
      updates.displayUsername = usernameRaw
    }

    if (body.email !== undefined) {
      const emailRaw = body.email.trim()
      const usernameForEmail = String(
        updates.username ?? existing.username ?? 'user',
      )
      const email = emailRaw
        ? emailRaw.toLowerCase()
        : toPlaceholderEmail(usernameForEmail)

      if (emailRaw) {
        const emailTaken = await authDb.collection('user').findOne({ email })
        if (
          emailTaken &&
          String(emailTaken.id ?? emailTaken._id) !==
            String(existing.id ?? existing._id)
        ) {
          throw new AppError('Email is already in use', 400)
        }
      }

      updates.email = email
    }

    if (body.phone !== undefined) {
      updates.phone = body.phone.trim()
    }

    if (Object.keys(updates).length > 1) {
      await authDb.collection('user').updateOne(userIdFilter(userId), {
        $set: updates,
      })
    }

    const newPassword =
      typeof body.newPassword === 'string' ? body.newPassword.trim() : ''
    if (newPassword) {
      if (newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters', 400)
      }
      try {
        await auth.api.setUserPassword({
          body: {
            userId: String(existing.id ?? existing._id),
            newPassword,
          },
          headers: fromNodeHeaders(req.headers),
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Could not update password'
        throw new AppError(message, 400)
      }
    }

    const updated = await authDb.collection('user').findOne(userIdFilter(userId))
    if (!updated) throw new AppError('User not found after update', 404)

    res.json({
      message: `Updated ${String(updated.username ?? updated.name)}`,
      user: toStaffUserDto(updated as Record<string, unknown>),
    })
  } catch (error) {
    next(error)
  }
}
