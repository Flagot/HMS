import type { NextFunction, Request, Response } from 'express'

export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
}
