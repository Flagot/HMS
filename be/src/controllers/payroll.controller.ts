import type { NextFunction, Request, Response } from 'express'
import { ObjectId, type Filter, type Document as MongoDocument } from 'mongodb'
import { authDb } from '../auth/auth.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { Expense } from '../models/Expense.js'
import { PayrollProfile } from '../models/PayrollProfile.js'
import { PayrollRecord, type IPayrollRecord } from '../models/PayrollRecord.js'

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

function parseMonth(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return currentMonth()
  }
  if (typeof value !== 'string' || !MONTH_PATTERN.test(value)) {
    throw new AppError('Month must be in YYYY-MM format', 400)
  }
  return value
}

function previousMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, mon - 1 - 1, 1))
  return date.toISOString().slice(0, 7)
}

export type PayStatus = 'paid' | 'upcoming' | 'due' | 'overdue' | 'unpaid'

type PayrollEmployee = {
  userId: string
  username: string
  name: string
  role: string
  deactivated: boolean
  paid: boolean
  salary: number | null
  payDay: number | null
  payStatus: PayStatus
  dueDate: string | null
  daysOverdue: number
  suggestedAmount: number | null
  record: {
    id: string
    amount: number
    paidOn: string
    note?: string
  } | null
}

function startOfUtcToday(): Date {
  const now = new Date()
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
}

/** Due date for a month: pay day clamped to the month's last day. */
function dueDateFor(month: string, payDay: number): Date {
  const [year, mon] = month.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(year, mon, 0)).getUTCDate()
  return new Date(Date.UTC(year, mon - 1, Math.min(payDay, daysInMonth)))
}

function computePayStatus(
  month: string,
  payDay: number | null,
  paid: boolean,
): { payStatus: PayStatus; dueDate: string | null; daysOverdue: number } {
  if (paid) return { payStatus: 'paid', dueDate: null, daysOverdue: 0 }
  if (!payDay) return { payStatus: 'unpaid', dueDate: null, daysOverdue: 0 }

  const due = dueDateFor(month, payDay)
  const today = startOfUtcToday()
  const dayDiff = Math.floor((today.getTime() - due.getTime()) / 86_400_000)
  const dueDate = due.toISOString().slice(0, 10)

  if (dayDiff < 0) return { payStatus: 'upcoming', dueDate, daysOverdue: 0 }
  if (dayDiff === 0) return { payStatus: 'due', dueDate, daysOverdue: 0 }
  return { payStatus: 'overdue', dueDate, daysOverdue: dayDiff }
}

type AuthUserDoc = {
  _id?: { toString(): string }
  id?: string
  username?: string
  name?: string
  role?: string
  banned?: boolean
}

function userIdOf(user: AuthUserDoc): string {
  return String(user.id ?? user._id ?? '')
}

export async function getAdminPayroll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const month = parseMonth(req.query.month)

    const [users, records, previousRecords, profiles] = await Promise.all([
      authDb
        .collection('user')
        .find({}, { projection: { username: 1, name: 1, role: 1, banned: 1 } })
        .sort({ name: 1 })
        .toArray() as Promise<AuthUserDoc[]>,
      PayrollRecord.find({ month }).lean(),
      PayrollRecord.find({ month: previousMonth(month) }).lean(),
      PayrollProfile.find().lean(),
    ])

    const recordByUser = new Map(records.map((r) => [r.userId, r]))
    const previousByUser = new Map(previousRecords.map((r) => [r.userId, r]))
    const profileByUser = new Map(profiles.map((p) => [p.userId, p]))

    const employees: PayrollEmployee[] = users.map((user) => {
      const userId = userIdOf(user)
      const record = recordByUser.get(userId)
      const previous = previousByUser.get(userId)
      const profile = profileByUser.get(userId)
      const status = computePayStatus(
        month,
        profile?.payDay ?? null,
        Boolean(record),
      )
      return {
        userId,
        username: String(user.username ?? ''),
        name: String(user.name ?? user.username ?? 'Unknown'),
        role: String(user.role ?? 'staff'),
        deactivated: Boolean(user.banned),
        paid: Boolean(record),
        salary: profile?.salary ?? null,
        payDay: profile?.payDay ?? null,
        ...status,
        suggestedAmount:
          profile?.salary ?? record?.amount ?? previous?.amount ?? null,
        record: record
          ? {
              id: String(record._id),
              amount: record.amount,
              paidOn: record.paidOn.toISOString(),
              ...(record.note ? { note: record.note } : {}),
            }
          : null,
      }
    })

    const paid = employees.filter((e) => e.paid)
    res.json({
      month,
      employees,
      summary: {
        employeeCount: employees.length,
        paidCount: paid.length,
        unpaidCount: employees.length - paid.length,
        dueCount: employees.filter((e) => e.payStatus === 'due').length,
        overdueCount: employees.filter((e) => e.payStatus === 'overdue')
          .length,
        totalPaid: paid.reduce((sum, e) => sum + (e.record?.amount ?? 0), 0),
      },
    })
  } catch (error) {
    next(error)
  }
}

/** Set or update an employee's monthly salary and pay day. */
export async function updatePayrollProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = String(req.params.userId ?? '')
    if (!userId) throw new AppError('User id is required', 400)

    const salary = Number(req.body?.salary)
    const payDay = Number(req.body?.payDay)
    if (!Number.isFinite(salary) || salary < 0) {
      throw new AppError('A valid salary is required', 400)
    }
    if (!Number.isInteger(payDay) || payDay < 1 || payDay > 31) {
      throw new AppError('Pay day must be a day of the month (1–31)', 400)
    }

    const idClauses: Filter<MongoDocument>[] = [{ id: userId }]
    if (ObjectId.isValid(userId)) {
      idClauses.push({ _id: new ObjectId(userId) })
    }
    const user = await authDb.collection('user').findOne({ $or: idClauses })
    if (!user) throw new AppError('Employee not found', 404)

    const profile = await PayrollProfile.findOneAndUpdate(
      { userId },
      { salary, payDay },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )

    res.json({
      userId,
      salary: profile.salary,
      payDay: profile.payDay,
    })
  } catch (error) {
    next(error)
  }
}

/** Salaries due today or overdue for the current month (active employees only). */
export async function getPayrollAlerts(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const month = currentMonth()

    const [users, records, profiles] = await Promise.all([
      authDb
        .collection('user')
        .find(
          { banned: { $ne: true } },
          { projection: { username: 1, name: 1, role: 1 } },
        )
        .toArray() as Promise<AuthUserDoc[]>,
      PayrollRecord.find({ month }).lean(),
      PayrollProfile.find().lean(),
    ])

    const paidUsers = new Set(records.map((r) => r.userId))
    const profileByUser = new Map(profiles.map((p) => [p.userId, p]))

    const alerts = users.flatMap((user) => {
      const userId = userIdOf(user)
      if (paidUsers.has(userId)) return []
      const profile = profileByUser.get(userId)
      if (!profile) return []

      const status = computePayStatus(month, profile.payDay, false)
      if (status.payStatus !== 'due' && status.payStatus !== 'overdue') {
        return []
      }
      return [
        {
          userId,
          name: String(user.name ?? user.username ?? 'Unknown'),
          payDay: profile.payDay,
          dueDate: status.dueDate,
          payStatus: status.payStatus,
          daysOverdue: status.daysOverdue,
        },
      ]
    })

    res.json({
      month,
      dueCount: alerts.filter((a) => a.payStatus === 'due').length,
      overdueCount: alerts.filter((a) => a.payStatus === 'overdue').length,
      alerts,
    })
  } catch (error) {
    next(error)
  }
}

export async function markPayrollPaid(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = String(req.params.userId ?? '')
    if (!userId) throw new AppError('User id is required', 400)

    const month = parseMonth(req.body?.month)
    const amount = Number(req.body?.amount)
    if (!Number.isFinite(amount) || amount < 0) {
      throw new AppError('A valid salary amount is required', 400)
    }
    const note =
      typeof req.body?.note === 'string' && req.body.note.trim()
        ? req.body.note.trim()
        : undefined

    const idClauses: Filter<MongoDocument>[] = [{ id: userId }]
    if (ObjectId.isValid(userId)) {
      idClauses.push({ _id: new ObjectId(userId) })
    }
    const user = (await authDb
      .collection('user')
      .findOne({ $or: idClauses })) as AuthUserDoc | null

    if (!user) throw new AppError('Employee not found', 404)

    const existing = await PayrollRecord.findOne({ userId, month })
    if (existing) {
      throw new AppError('Salary for this month is already marked as paid', 400)
    }

    const name = String(user.name ?? user.username ?? 'Unknown')
    const paidOn = new Date()

    // Record the salary as a payroll expense so it shows up in
    // income/expense analytics for the month it was paid.
    const expense = await Expense.create({
      title: `Salary — ${name} (${month})`,
      category: 'payroll',
      amount,
      spentOn: paidOn,
      ...(note ? { note } : {}),
    })

    let record: IPayrollRecord
    try {
      record = await PayrollRecord.create({
        userId,
        username: String(user.username ?? ''),
        name,
        role: String(user.role ?? 'staff'),
        month,
        amount,
        paidOn,
        paidBy: (req as AuthedRequest).sessionUser?.id,
        ...(note ? { note } : {}),
        expenseId: String(expense._id),
      })
    } catch (error) {
      // Roll back the expense if a concurrent request already created the record.
      await Expense.deleteOne({ _id: expense._id })
      throw error
    }

    res.status(201).json({
      message: `Marked ${name} as paid for ${month}`,
      record: {
        id: String(record._id),
        amount: record.amount,
        paidOn: record.paidOn.toISOString(),
        ...(record.note ? { note: record.note } : {}),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function unmarkPayrollPaid(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = String(req.params.userId ?? '')
    if (!userId) throw new AppError('User id is required', 400)
    const month = parseMonth(req.body?.month)

    const record = await PayrollRecord.findOne({ userId, month })
    if (!record) {
      throw new AppError('No payment recorded for this month', 404)
    }

    if (record.expenseId) {
      await Expense.deleteOne({ _id: record.expenseId })
    }
    await record.deleteOne()

    res.json({ ok: true, message: `Payment for ${record.name} (${month}) undone` })
  } catch (error) {
    next(error)
  }
}
