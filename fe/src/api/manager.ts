import type {
  CreateExpenseInput,
  Expense,
  ManagerAnalytics,
  ManagerExpensesResult,
  ManagerFnbDetail,
  ManagerIncomeDetail,
  ManagerOverview,
  ManagerPeriod,
  ManagerRoom,
} from '../types/manager'
import { apiFetch } from './client'

function periodQuery(period: ManagerPeriod, date: string) {
  return `?period=${encodeURIComponent(period)}&date=${encodeURIComponent(date)}`
}

export function fetchManagerOverview(date?: string): Promise<ManagerOverview> {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return apiFetch<ManagerOverview>(`/api/manager/overview${query}`)
}

export function fetchManagerRooms(): Promise<ManagerRoom[]> {
  return apiFetch<ManagerRoom[]>('/api/manager/rooms')
}

export function fetchManagerAnalytics(
  period: ManagerPeriod,
  date: string,
): Promise<ManagerAnalytics> {
  return apiFetch<ManagerAnalytics>(`/api/manager/analytics${periodQuery(period, date)}`)
}

export function fetchManagerIncome(
  period: ManagerPeriod,
  date: string,
): Promise<ManagerIncomeDetail> {
  return apiFetch<ManagerIncomeDetail>(`/api/manager/income${periodQuery(period, date)}`)
}

export function fetchManagerFnb(
  period: ManagerPeriod,
  date: string,
): Promise<ManagerFnbDetail> {
  return apiFetch<ManagerFnbDetail>(`/api/manager/fnb${periodQuery(period, date)}`)
}

export function fetchManagerExpenses(
  period: ManagerPeriod,
  date: string,
): Promise<ManagerExpensesResult> {
  return apiFetch<ManagerExpensesResult>(
    `/api/manager/expenses${periodQuery(period, date)}`,
  )
}

export function createManagerExpense(input: CreateExpenseInput): Promise<Expense> {
  return apiFetch<Expense>('/api/manager/expenses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteManagerExpense(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/manager/expenses/${id}`, {
    method: 'DELETE',
  })
}
