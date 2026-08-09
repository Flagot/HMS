import { useState } from 'react'
import type {
  CreateReservationInput,
  ReceptionRoom,
  Reservation,
} from '../../types/reservation'
import { formatMoney } from '../../utils/money'
import { canReserveRoom } from '../../utils/stayAvailability'
import { ReserveRoomForm } from './ReserveRoomForm'

const occupancyStyles = {
  vacant: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  reserved: 'bg-sky-100 text-sky-800 ring-sky-200',
  occupied: 'bg-amber-100 text-amber-900 ring-amber-200',
}

const housekeepingLabels = {
  dirty: 'Needs cleaning',
  in_progress: 'Cleaning',
  clean: 'Clean',
  inspect: 'Inspect',
}

type RoomDetailModalProps = {
  room: ReceptionRoom
  reservations: Reservation[]
  stayCheckIn: string
  stayCheckOut: string
  isReserving: boolean
  onClose: () => void
  onReserve: (input: CreateReservationInput) => Promise<void>
}

export function RoomDetailModal({
  room,
  reservations,
  stayCheckIn,
  stayCheckOut,
  isReserving,
  onClose,
  onReserve,
}: RoomDetailModalProps) {
  const [showReserveForm, setShowReserveForm] = useState(false)
  const canReserve = canReserveRoom(room, reservations, stayCheckIn, stayCheckOut)

  let unavailableReason = ''
  if (!canReserve) {
    if (room.housekeepingStatus !== 'clean') {
      unavailableReason =
        'Wait until housekeeping marks this room clean before reserving.'
    } else {
      unavailableReason =
        'This room already has a reservation overlapping the selected dates.'
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-hms-navy/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`room-detail-${room.number}`}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-hms-border bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-hms-cream">
          <img
            src={room.imageUrl}
            alt={`${room.name} — room ${room.number}`}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-hms-navy shadow-sm hover:bg-white"
          >
            Close
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-hms-gold">
                Room {room.number}
              </p>
              <h2
                id={`room-detail-${room.number}`}
                className="mt-1 font-display text-2xl font-semibold text-hms-navy"
              >
                {room.name}
              </h2>
              <p className="mt-1 text-sm text-hms-muted">
                Floor {room.floor} · {room.type}
              </p>
              <p className="mt-1 text-xs text-hms-muted">
                Selected stay: {stayCheckIn} → {stayCheckOut}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  canReserve
                    ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                    : occupancyStyles[room.occupancy]
                }`}
              >
                {canReserve ? 'Free for stay' : room.occupancy}
              </span>
              <span className="rounded-full bg-hms-cream px-2.5 py-0.5 text-xs font-medium text-hms-navy ring-1 ring-inset ring-hms-border">
                {housekeepingLabels[room.housekeepingStatus]}
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-hms-muted">{room.description}</p>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-hms-muted">Rate / night</dt>
              <dd className="mt-1 font-semibold text-hms-navy">
                {formatMoney(room.ratePerNight)}
              </dd>
            </div>
            <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-hms-muted">Capacity</dt>
              <dd className="mt-1 font-semibold text-hms-navy">
                {room.capacity} guest{room.capacity > 1 ? 's' : ''}
              </dd>
            </div>
            <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-hms-muted">Bed</dt>
              <dd className="mt-1 font-semibold text-hms-navy">{room.bedType}</dd>
            </div>
            <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-hms-muted">Size</dt>
              <dd className="mt-1 font-semibold text-hms-navy">{room.sizeSqm} m²</dd>
            </div>
          </dl>

          <div className="mt-5">
            <h3 className="text-sm font-semibold text-hms-navy">Amenities</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {room.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className="rounded-full border border-hms-border bg-white px-3 py-1 text-xs text-hms-navy"
                >
                  {amenity}
                </li>
              ))}
            </ul>
          </div>

          {room.note ? (
            <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Note: {room.note}
            </p>
          ) : null}

          {!showReserveForm ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hms-border pt-4">
              <p className="text-sm text-hms-muted">
                {canReserve
                  ? 'This room is free for the selected dates and clean — ready to reserve.'
                  : unavailableReason}
              </p>
              {canReserve ? (
                <button
                  type="button"
                  onClick={() => setShowReserveForm(true)}
                  className="rounded-lg bg-hms-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-hms-navy-light"
                >
                  Reserve this room
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-6">
              <ReserveRoomForm
                room={room}
                initialCheckIn={stayCheckIn}
                initialCheckOut={stayCheckOut}
                isSubmitting={isReserving}
                onCancel={() => setShowReserveForm(false)}
                onSubmit={onReserve}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
