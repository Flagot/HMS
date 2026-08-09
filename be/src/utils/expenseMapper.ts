import type { IExpense } from '../models/Expense.js'
import type { ExpenseResponse } from '../types/expense.js'
import { roundMoney } from './payment.js'

export function toExpenseResponse(expense: IExpense): ExpenseResponse {
  return {
    id: expense._id.toString(),
    title: expense.title,
    category: expense.category,
    amount: roundMoney(expense.amount),
    spentOn: expense.spentOn.toISOString().slice(0, 10),
    note: expense.note,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  }
}
