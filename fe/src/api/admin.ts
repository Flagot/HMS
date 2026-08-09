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
