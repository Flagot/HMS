import { useMemo, useState, type FormEvent } from 'react'
import type { ReceptionRoom, Reservation } from '../../types/reservation'
import { formatMoney, roundMoney } from '../../utils/money'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { ReservationStatusBadge } from './ReservationStatusBadge'

type ReservationCardProps = {
  reservation: Reservation
  rooms: ReceptionRoom[]
  isUpdating?: boolean
  onAssignRoom: (reservationId: string, roomId: string) => void
  onUpdatePayment: (reservationId: string, amountPaid: number) => void
  onCheckIn: (reservationId: string, roomId?: string) => void
  onCheckOut: (reservationId: string) => void
  onCancel: (reservationId: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function ReservationCard({
  reservation,
  rooms,
  isUpdating = false,
  onAssignRoom,
  onUpdatePayment,
  onCheckIn,
  onCheckOut,
  onCancel,
}: ReservationCardProps) {
  const [selectedRoomId, setSelectedRoomId] = useState(reservation.roomId ?? '')
  const [paidInput, setPaidInput] = useState(String(reservation.amountPaid ?? 0))
  const [editingPayment, setEditingPayment] = useState(false)

  const candidateRooms = useMemo(
    () =>
      rooms.filter(
        (room) =>
          room.type === reservation.roomType &&
          (room.occupancy === 'vacant' || room.id === reservation.roomId) &&
          (room.housekeepingStatus === 'clean' || room.id === reservation.roomId),
      ),
    [rooms, reservation],
  )

  const canEditPayment =
    reservation.status === 'reserved' || reservation.status === 'checked_in'

  function handlePaymentSubmit(event: FormEvent) {
    event.preventDefault()
    const value = roundMoney(Number(paidInput))
    if (!Number.isFinite(value) || value < 0) return
    onUpdatePayment(reservation.id, Math.min(value, reservation.totalAmount))
    setEditingPayment(false)
  }

  return (
    <article className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-hms-navy">
            {reservation.guestName}
          </p>
          <p className="mt-1 text-sm text-hms-muted">
            {reservation.confirmationCode}
            <span className="mx-1.5 text-hms-border">·</span>
            {reservation.roomType}
            <span className="mx-1.5 text-hms-border">·</span>
            {reservation.adults} adult{reservation.adults > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PaymentStatusBadge status={reservation.paymentStatus} />
          <ReservationStatusBadge status={reservation.status} />
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-hms-muted sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide">Stay</dt>
          <dd className="mt-0.5 text-hms-navy">
            {formatDate(reservation.checkInDate)} → {formatDate(reservation.checkOutDate)}
            <span className="text-hms-muted">
              {' '}
              · {reservation.nights} night{reservation.nights > 1 ? 's' : ''}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide">Room</dt>
          <dd className="mt-0.5 text-hms-navy">
            {reservation.roomNumber ? `Room ${reservation.roomNumber}` : 'Unassigned'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide">Billing</dt>
          <dd className="mt-0.5 text-hms-navy">
            {formatMoney(reservation.totalAmount)}
            <span className="text-hms-muted">
              {' '}
              ({formatMoney(reservation.ratePerNight)}/night)
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide">Payment</dt>
          <dd className="mt-0.5 text-hms-navy">
            Paid {formatMoney(reservation.amountPaid)}
            {reservation.balanceDue > 0 ? (
              <span className="text-amber-800">
                {' '}
                · due {formatMoney(reservation.balanceDue)}
              </span>
            ) : null}
          </dd>
        </div>
        {reservation.phone ? (
          <div>
            <dt className="text-xs uppercase tracking-wide">Phone</dt>
            <dd className="mt-0.5 text-hms-navy">{reservation.phone}</dd>
          </div>
        ) : null}
        {reservation.note ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide">Note</dt>
            <dd className="mt-0.5 text-hms-navy">{reservation.note}</dd>
          </div>
        ) : null}
      </dl>

      {canEditPayment ? (
        <div className="mt-4 border-t border-hms-border pt-4">
          {editingPayment ? (
            <form onSubmit={handlePaymentSubmit} className="flex flex-wrap items-end gap-2">
              <label className="block min-w-40 flex-1 text-sm">
                <span className="mb-1.5 block font-medium text-hms-navy">Amount paid</span>
                <input
                  type="number"
                  min={0}
                  max={reservation.totalAmount}
                  step={0.01}
                  value={paidInput}
                  onChange={(e) => setPaidInput(e.target.value)}
                  className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
                />
              </label>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => {
                  setPaidInput(String(reservation.amountPaid))
                  setEditingPayment(false)
                }}
                className="rounded-lg border border-hms-border px-3 py-2 text-xs font-medium text-hms-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="rounded-lg bg-hms-navy px-3 py-2 text-xs font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
              >
                Save payment
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => {
                  setPaidInput(String(reservation.totalAmount))
                  onUpdatePayment(reservation.id, reservation.totalAmount)
                  setEditingPayment(false)
                }}
                className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
              >
                Mark fully paid
              </button>
            </form>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => {
                setPaidInput(String(reservation.amountPaid))
                setEditingPayment(true)
              }}
              className="rounded-lg border border-hms-border px-3 py-1.5 text-xs font-medium text-hms-navy hover:bg-hms-cream disabled:opacity-60"
            >
              Update payment
            </button>
          )}
        </div>
      ) : null}

      {reservation.status === 'reserved' ? (
        <div className="mt-4 space-y-3 border-t border-hms-border pt-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Room assignment</span>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              <option value="">Select clean vacant room</option>
              {candidateRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.number} · Floor {room.floor} · {room.housekeepingStatus}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onCancel(reservation.id)}
              className="rounded-lg border border-hms-border px-3 py-1.5 text-xs font-medium text-hms-muted hover:text-hms-navy disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isUpdating || !selectedRoomId}
              onClick={() => onAssignRoom(reservation.id, selectedRoomId)}
              className="rounded-lg border border-hms-border px-3 py-1.5 text-xs font-medium text-hms-navy hover:bg-hms-cream disabled:opacity-60"
            >
              Assign room
            </button>
            <button
              type="button"
              disabled={isUpdating || !(selectedRoomId || reservation.roomId)}
              onClick={() =>
                onCheckIn(reservation.id, selectedRoomId || reservation.roomId)
              }
              className="rounded-lg bg-hms-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
            >
              {isUpdating ? 'Updating…' : 'Check in'}
            </button>
          </div>
        </div>
      ) : null}

      {reservation.status === 'checked_in' ? (
        <div className="mt-4 flex justify-end border-t border-hms-border pt-4">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onCheckOut(reservation.id)}
            className="rounded-lg bg-hms-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
          >
            {isUpdating ? 'Updating…' : 'Check out'}
          </button>
        </div>
      ) : null}
    </article>
  )
}
