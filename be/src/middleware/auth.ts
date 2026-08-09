import type { NextFunction, Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { auth, type SessionUser } from '../auth/auth.js'
import type { StaffRoleId } from '../auth/permissions.js'
import { AppError } from './errorHandler.js'

export type AuthedRequest = Request & {
  sessionUser: SessionUser
  sessionRole: StaffRoleId
}

function roleFromUser(user: SessionUser): StaffRoleId | null {
  const raw = (user as { role?: string | null }).role
  if (!raw) return null
  // Better Auth may store multiple roles as comma-separated values.
  const primary = raw.split(',')[0]?.trim()
  if (
    primary === 'admin' ||
    primary === 'manager' ||
    primary === 'store' ||
    primary === 'reception' ||
    primary === 'waiter' ||
    primary === 'kitchen' ||
    primary === 'housekeeping'
  ) {
    return primary
  }
  return null
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session?.user) {
      next(new AppError('Authentication required', 401))
      return
    }

    if ((session.user as { banned?: boolean }).banned) {
      next(new AppError('Account is banned', 403))
      return
    }

    const role = roleFromUser(session.user)
    if (!role) {
      next(new AppError('Account has no valid staff role', 403))
      return
    }

    ;(req as AuthedRequest).sessionUser = session.user
    ;(req as AuthedRequest).sessionRole = role
    next()
  } catch (error) {
    next(error)
  }
}

export function requireRole(...allowed: StaffRoleId[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authed = req as AuthedRequest
    if (!authed.sessionRole) {
      next(new AppError('Authentication required', 401))
      return
    }

    if (authed.sessionRole === 'admin' || allowed.includes(authed.sessionRole)) {
      next()
      return
    }

    next(new AppError('You do not have access to this resource', 403))
  }
}
