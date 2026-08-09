import type { Room } from '../types/room'
import type {
  AdminAnalytics,
  AdminMenuItem,
  AdminOverview,
  AdminPeriod,
  AdminSettings,
  CreateAdminMenuItemInput,
  CreateAdminRoomInput,
  UpdateAdminMenuItemInput,
  UpdateAdminRoomInput,
  UpdateAdminSettingsInput,
} from '../types/admin'
import { apiFetch } from './client'

export function fetchAdminOverview(): Promise<AdminOverview> {
  return apiFetch<AdminOverview>('/api/admin/overview')
}

export function fetchAdminAnalytics(
  period: AdminPeriod,
  date: string,
): Promise<AdminAnalytics> {
  return apiFetch<AdminAnalytics>(
    `/api/admin/analytics?period=${encodeURIComponent(period)}&date=${encodeURIComponent(date)}`,
  )
}

export function fetchAdminSettings(): Promise<AdminSettings> {
  return apiFetch<AdminSettings>('/api/admin/settings')
}

export function updateAdminSettings(
  input: UpdateAdminSettingsInput,
): Promise<AdminSettings> {
  return apiFetch<AdminSettings>('/api/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function fetchAdminRooms(): Promise<Room[]> {
  return apiFetch<Room[]>('/api/admin/rooms')
}

export function createAdminRoom(input: CreateAdminRoomInput): Promise<Room> {
  return apiFetch<Room>('/api/admin/rooms', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateAdminRoom(
  id: string,
  input: UpdateAdminRoomInput,
): Promise<Room> {
  return apiFetch<Room>(`/api/admin/rooms/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteAdminRoom(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/admin/rooms/${id}`, {
    method: 'DELETE',
  })
}

export function fetchAdminMenu(): Promise<AdminMenuItem[]> {
  return apiFetch<AdminMenuItem[]>('/api/admin/menu')
}

export function createAdminMenuItem(
  input: CreateAdminMenuItemInput,
): Promise<AdminMenuItem> {
  return apiFetch<AdminMenuItem>('/api/admin/menu', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateAdminMenuItem(
  id: string,
  input: UpdateAdminMenuItemInput,
): Promise<AdminMenuItem> {
  return apiFetch<AdminMenuItem>(`/api/admin/menu/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteAdminMenuItem(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/admin/menu/${id}`, {
    method: 'DELETE',
  })
}

export type PasswordResetRequest = {
  id: string
  userId: string
  username: string
  name: string
  role: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  resolvedAt?: string
}

export function fetchPasswordResetRequests(
  status: 'pending' | 'resolved' | 'dismissed' | 'all' = 'pending',
): Promise<{ requests: PasswordResetRequest[]; pendingCount: number }> {
  return apiFetch(
    `/api/admin/password-reset-requests?status=${encodeURIComponent(status)}`,
  )
}

export function fetchPasswordResetPendingCount(): Promise<{
  pendingCount: number
}> {
  return apiFetch('/api/admin/password-reset-requests/pending-count')
}

export function resolvePasswordResetRequest(
  id: string,
  newPassword: string,
): Promise<{ message: string; request: PasswordResetRequest }> {
  return apiFetch(`/api/admin/password-reset-requests/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  })
}

export function dismissPasswordResetRequest(
  id: string,
): Promise<{ message: string; request: PasswordResetRequest }> {
  return apiFetch(`/api/admin/password-reset-requests/${id}/dismiss`, {
    method: 'POST',
  })
}

export function submitPasswordResetRequest(
  username: string,
): Promise<{ message: string }> {
  return apiFetch('/api/password-reset-requests', {
    method: 'POST',
    body: JSON.stringify({ username }),
  })
}

export type PayStatus = 'paid' | 'upcoming' | 'due' | 'overdue' | 'unpaid'

export type PayrollEmployee = {
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

export type AdminPayroll = {
  month: string
  employees: PayrollEmployee[]
  summary: {
    employeeCount: number
    paidCount: number
    unpaidCount: number
    dueCount: number
    overdueCount: number
    totalPaid: number
  }
}

export type PayrollAlerts = {
  month: string
  dueCount: number
  overdueCount: number
  alerts: {
    userId: string
    name: string
    payDay: number
    dueDate: string | null
    payStatus: 'due' | 'overdue'
    daysOverdue: number
  }[]
}

export function fetchAdminPayroll(month?: string): Promise<AdminPayroll> {
  const query = month ? `?month=${encodeURIComponent(month)}` : ''
  return apiFetch<AdminPayroll>(`/api/admin/payroll${query}`)
}

export function markPayrollPaid(
  userId: string,
  input: { month: string; amount: number; note?: string },
): Promise<{ message: string }> {
  return apiFetch(`/api/admin/payroll/${userId}/pay`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function unmarkPayrollPaid(
  userId: string,
  month: string,
): Promise<{ ok: boolean; message: string }> {
  return apiFetch(`/api/admin/payroll/${userId}/unpay`, {
    method: 'POST',
    body: JSON.stringify({ month }),
  })
}

export function updatePayrollProfile(
  userId: string,
  input: { salary: number; payDay: number },
): Promise<{ userId: string; salary: number; payDay: number }> {
  return apiFetch(`/api/admin/payroll/${userId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function fetchPayrollAlerts(): Promise<PayrollAlerts> {
  return apiFetch<PayrollAlerts>('/api/admin/payroll/alerts')
}
