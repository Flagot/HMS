export const EXPENSE_CATEGORIES = [
  'payroll',
  'fnb_supplies',
  'housekeeping',
  'utilities',
  'maintenance',
  'amenities',
  'marketing',
  'other',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export type ExpenseResponse = {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  spentOn: string
  note?: string
  createdAt: string
  updatedAt: string
}

export type CreateExpenseInput = {
  title: string
  category: ExpenseCategory
  amount: number
  spentOn: string
  note?: string
}
