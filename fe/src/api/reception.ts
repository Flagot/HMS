import type {
  CreateReservationInput,
  IncomeSummary,
  ReceptionRoom,
  Reservation,
} from '../types/reservation'
import { apiFetch } from './client'

export function fetchReservations(): Promise<Reservation[]> {
  return apiFetch<Reservation[]>('/api/reception/reservations')
}

export function fetchReceptionRooms(): Promise<ReceptionRoom[]> {
  return apiFetch<ReceptionRoom[]>('/api/reception/rooms')
}

export function fetchIncomeSummary(date?: string): Promise<IncomeSummary> {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return apiFetch<IncomeSummary>(`/api/reception/income${query}`)
}

export function createReservation(
  input: CreateReservationInput,
): Promise<Reservation> {
  return apiFetch<Reservation>('/api/reception/reservations', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function assignReservationRoom(
  reservationId: string,
  roomId: string,
): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reception/reservations/${reservationId}/assign-room`, {
    method: 'PATCH',
    body: JSON.stringify({ roomId }),
  })
}

export function updateReservationPayment(
  reservationId: string,
  amountPaid: number,
): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reception/reservations/${reservationId}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ amountPaid }),
  })
}

export function checkInReservation(
  reservationId: string,
  roomId?: string,
): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reception/reservations/${reservationId}/check-in`, {
    method: 'POST',
    body: JSON.stringify(roomId ? { roomId } : {}),
  })
}

export function checkOutReservation(reservationId: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reception/reservations/${reservationId}/check-out`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function cancelReservation(reservationId: string): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reception/reservations/${reservationId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
