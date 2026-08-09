import type { Request, Response, NextFunction } from 'express'
import { authDb } from '../auth/auth.js'

/** Public bootstrap check: whether the first admin still needs to be created. */
export async function getSetupStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userCount = await authDb.collection('user').countDocuments()
    res.json({
      needsSetup: userCount === 0,
      userCount,
    })
  } catch (error) {
    next(error)
  }
}
