import type { Request, Response, NextFunction } from 'express'
import { getOrCreateHotelSettings } from '../utils/adminOverview.js'

/** Public hotel branding (no auth). */
export async function getHotelPublic(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const settings = await getOrCreateHotelSettings()
    res.setHeader('Cache-Control', 'no-store')
    res.json({ hotelName: settings.hotelName })
  } catch (error) {
    next(error)
  }
}
