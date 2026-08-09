import type { Request, Response, NextFunction } from 'express'
import { Expense } from '../models/Expense.js'
import { AppError } from '../middleware/errorHandler.js'
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from '../types/expense.js'
import type { ManagerPeriod } from '../types/manager.js'
import { toExpenseResponse } from '../utils/expenseMapper.js'
import {
  buildFnbDetail,
  buildIncomeDetail,
  buildManagerAnalytics,
  listExpensesInPeriod,
} from '../utils/managerAnalytics.js'
import {
  buildManagerOverview,
  loadRoomsWithOccupancy,
} from '../utils/managerOverview.js'
import { roundMoney } from '../utils/payment.js'

const validPeriods: ManagerPeriod[] = ['day', 'week', 'month']

function parseDay(dateParam?: string): Date {
  const day = dateParam ? new Date(`${dateParam}T12:00:00.000Z`) : new Date()
  if (Number.isNaN(day.getTime())) {
    throw new AppError('Invalid date', 400)
  }
  return day
}

function parsePeriod(periodParam?: unknown): ManagerPeriod {
  if (typeof periodParam !== 'string' || !validPeriods.includes(periodParam as ManagerPeriod)) {
    return 'day'
  }
  return periodParam as ManagerPeriod
}

export async function getManagerOverview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined
    const overview = await buildManagerOverview(parseDay(dateParam))
    res.json(overview)
  } catch (error) {
    next(error)
  }
}

export async function getManagerRooms(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rooms = await loadRoomsWithOccupancy()
    res.json(rooms)
  } catch (error) {
    next(error)
  }
}

export async function getManagerAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined
    const analytics = await buildManagerAnalytics(
      parsePeriod(req.query.period),
      parseDay(dateParam),
    )
    res.json(analytics)
  } catch (error) {
    next(error)
  }
}

export async function getManagerIncome(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined
    const detail = await buildIncomeDetail(
      parsePeriod(req.query.period),
      parseDay(dateParam),
    )
    res.json(detail)
  } catch (error) {
    next(error)
  }
}

export async function getManagerFnb(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined
    const detail = await buildFnbDetail(
      parsePeriod(req.query.period),
      parseDay(dateParam),
    )
    res.json(detail)
  } catch (error) {
    next(error)
  }
}

export async function getManagerExpenses(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dateParam = typeof req.query.date === 'string' ? req.query.date : undefined
    const result = await listExpensesInPeriod(
      parsePeriod(req.query.period),
      parseDay(dateParam),
    )
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function createManagerExpense(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { title, category, amount, spentOn, note } = req.body as {
      title?: string
      category?: ExpenseCategory
      amount?: number
      spentOn?: string
      note?: string
    }

    if (!title?.trim()) throw new AppError('Title is required', 400)
    if (!category || !EXPENSE_CATEGORIES.includes(category)) {
      throw new AppError('Invalid expense category', 400)
    }

    const value = roundMoney(Number(amount))
    if (!Number.isFinite(value) || value < 0) {
      throw new AppError('amount must be a non-negative number', 400)
    }

    const spent = spentOn ? new Date(`${spentOn}T12:00:00.000Z`) : new Date()
    if (Number.isNaN(spent.getTime())) {
      throw new AppError('Invalid spentOn date', 400)
    }

    const expense = await Expense.create({
      title: title.trim(),
      category,
      amount: value,
      spentOn: spent,
      note: note?.trim() || undefined,
    })

    res.status(201).json(toExpenseResponse(expense))
  } catch (error) {
    next(error)
  }
}

export async function deleteManagerExpense(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id)
    if (!expense) throw new AppError('Expense not found', 404)
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
}
