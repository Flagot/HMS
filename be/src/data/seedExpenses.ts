import type { ExpenseCategory } from '../types/expense.js'

export type SeedExpense = {
  title: string
  category: ExpenseCategory
  amount: number
  spentOn: Date
  note?: string
}

export const seedExpenses: SeedExpense[] = [
  {
    title: 'Front desk wages',
    category: 'payroll',
    amount: 8500,
    spentOn: new Date('2026-08-09T10:00:00.000Z'),
  },
  {
    title: 'Kitchen ingredients restock',
    category: 'fnb_supplies',
    amount: 4200,
    spentOn: new Date('2026-08-09T08:00:00.000Z'),
    note: 'Produce + dairy',
  },
  {
    title: 'Laundry chemicals',
    category: 'housekeeping',
    amount: 980,
    spentOn: new Date('2026-08-08T14:00:00.000Z'),
  },
  {
    title: 'Electricity bill share',
    category: 'utilities',
    amount: 6100,
    spentOn: new Date('2026-08-07T12:00:00.000Z'),
  },
  {
    title: 'AC unit repair — floor 2',
    category: 'maintenance',
    amount: 2500,
    spentOn: new Date('2026-08-06T16:00:00.000Z'),
  },
  {
    title: 'Guest toiletries',
    category: 'amenities',
    amount: 1400,
    spentOn: new Date('2026-08-05T11:00:00.000Z'),
  },
  {
    title: 'Weekend ads boost',
    category: 'marketing',
    amount: 1800,
    spentOn: new Date('2026-08-04T09:00:00.000Z'),
  },
  {
    title: 'Kitchen wages',
    category: 'payroll',
    amount: 7200,
    spentOn: new Date('2026-08-02T10:00:00.000Z'),
  },
  {
    title: 'Beverage stock',
    category: 'fnb_supplies',
    amount: 3100,
    spentOn: new Date('2026-08-01T13:00:00.000Z'),
  },
]
