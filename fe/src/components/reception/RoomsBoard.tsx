import { useEffect, useMemo, useState } from 'react'
import type {
  CreateReservationInput,
  HousekeepingStatus,
  ReceptionRoom,
  Reservation,
  RoomOccupancy,
  RoomType,
} from '../../types/reservation'
import { formatMoney } from '../../utils/money'
import { canReserveRoom, toStayDateKey } from '../../utils/stayAvailability'
import { RoomDetailModal } from './RoomDetailModal'

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

function defaultStayDates() {
  const checkIn = new Date()
  const checkOut = new Date()
  checkOut.setDate(checkOut.getDate() + 1)
  return {
    checkIn: toStayDateKey(checkIn),
    checkOut: toStayDateKey(checkOut),
  }
}

type RoomsBoardProps = {
  rooms: ReceptionRoom[]
  reservations: Reservation[]
  loading: boolean
  isReserving: boolean
  onReserve: (input: CreateReservationInput) => Promise<void>
}

export function RoomsBoard({
  rooms,
  reservations,
  loading,
  isReserving,
  onReserve,
}: RoomsBoardProps) {
  const defaults = defaultStayDates()
  const [selectedRoom, setSelectedRoom] = useState<ReceptionRoom | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | RoomType>('all')
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | RoomOccupancy>('all')
  const [housekeepingFilter, setHousekeepingFilter] = useState<'all' | HousekeepingStatus>(
    'all',
  )
  const [floorFilter, setFloorFilter] = useState<'all' | number>('all')
  const [checkInFilter, setCheckInFilter] = useState(defaults.checkIn)
  const [checkOutFilter, setCheckOutFilter] = useState(defaults.checkOut)
  const [reservableOnly, setReservableOnly] = useState(true)

  useEffect(() => {
    if (checkOutFilter <= checkInFilter) {
      const next = new Date(`${checkInFilter}T12:00:00`)
      next.setDate(next.getDate() + 1)
      setCheckOutFilter(toStayDateKey(next))
    }
  }, [checkInFilter, checkOutFilter])

  const floors = useMemo(
    () => [...new Set(rooms.map((room) => room.floor))].sort((a, b) => a - b),
    [rooms],
  )

  const datesValid = checkOutFilter > checkInFilter

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (typeFilter !== 'all' && room.type !== typeFilter) return false
      if (occupancyFilter !== 'all' && room.occupancy !== occupancyFilter) return false
      if (housekeepingFilter !== 'all' && room.housekeepingStatus !== housekeepingFilter) {
        return false
      }
      if (floorFilter !== 'all' && room.floor !== floorFilter) return false

      const freeForDates =
        datesValid &&
        canReserveRoom(room, reservations, checkInFilter, checkOutFilter)

      if (reservableOnly) {
        return freeForDates
      }

      return true
    })
  }, [
    rooms,
    reservations,
    typeFilter,
    occupancyFilter,
    housekeepingFilter,
    floorFilter,
    reservableOnly,
    checkInFilter,
    checkOutFilter,
    datesValid,
  ])

  const selectClass =
    'rounded-lg border border-hms-border bg-white px-3 py-2 text-sm text-hms-navy outline-none focus:border-hms-navy'

  if (loading) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading rooms…
      </p>
    )
  }

  return (
    <>
      <section className="mb-6 rounded-xl border border-hms-border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-hms-navy">Filter rooms</h2>
            <p className="mt-1 text-xs text-hms-muted">
              Showing {filteredRooms.length} of {rooms.length} rooms
              {datesValid
                ? ` · stay ${checkInFilter} → ${checkOutFilter}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const reset = defaultStayDates()
              setTypeFilter('all')
              setOccupancyFilter('all')
              setHousekeepingFilter('all')
              setFloorFilter('all')
              setCheckInFilter(reset.checkIn)
              setCheckOutFilter(reset.checkOut)
              setReservableOnly(true)
            }}
            className="text-xs font-medium text-hms-muted hover:text-hms-navy"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-hms-muted">
              Check-in
            </span>
            <input
              type="date"
              value={checkInFilter}
              onChange={(e) => setCheckInFilter(e.target.value)}
              className={`w-full ${selectClass}`}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-hms-muted">
              Check-out
            </span>
            <input
              type="date"
              value={checkOutFilter}
              min={checkInFilter}
              onChange={(e) => setCheckOutFilter(e.target.value)}
              className={`w-full ${selectClass}`}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-hms-muted">
              Type
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | RoomType)}
              className={`w-full ${selectClass}`}
            >
              <option value="all">All types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-hms-muted">
              Occupancy now
            </span>
            <select
              value={occupancyFilter}
              onChange={(e) =>
                setOccupancyFilter(e.target.value as 'all' | RoomOccupancy)
              }
              className={`w-full ${selectClass}`}
            >
              <option value="all">All</option>
              <option value="vacant">Vacant</option>
              <option value="reserved">Reserved</option>
              <option value="occupied">Occupied</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-hms-muted">
              Housekeeping
            </span>
            <select
              value={housekeepingFilter}
              onChange={(e) =>
                setHousekeepingFilter(e.target.value as 'all' | HousekeepingStatus)
              }
              className={`w-full ${selectClass}`}
            >
              <option value="all">All</option>
              <option value="clean">Clean</option>
              <option value="dirty">Needs cleaning</option>
              <option value="in_progress">Cleaning</option>
              <option value="inspect">Inspect</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-hms-muted">
              Floor
            </span>
            <select
              value={floorFilter === 'all' ? 'all' : String(floorFilter)}
              onChange={(e) =>
                setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className={`w-full ${selectClass}`}
            >
              <option value="all">All floors</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 flex items-center gap-2 text-sm text-hms-navy">
          <input
            type="checkbox"
            checked={reservableOnly}
            onChange={(e) => setReservableOnly(e.target.checked)}
            className="rounded border-hms-border"
          />
          Only rooms free for these dates
        </label>
      </section>

      {filteredRooms.length === 0 ? (
        <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
          No rooms match these filters for the selected dates.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const freeForStay = canReserveRoom(
              room,
              reservations,
              checkInFilter,
              checkOutFilter,
            )
            const inHouseStay = reservations.find(
              (reservation) =>
                reservation.roomId === room.id &&
                reservation.status === 'checked_in',
            )
            const balanceDue = inHouseStay?.balanceDue ?? 0

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoom(room)}
                className="group overflow-hidden rounded-xl border border-hms-border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-hms-gold/40 hover:shadow-md"
              >
                <div className="aspect-[16/10] overflow-hidden bg-hms-cream">
                  <img
                    src={room.imageUrl}
                    alt={`${room.name} — room ${room.number}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-semibold text-hms-navy">
                        {room.number}
                      </p>
                      <p className="mt-0.5 text-sm text-hms-muted">{room.name}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        freeForStay
                          ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                          : occupancyStyles[room.occupancy]
                      }`}
                    >
                      {freeForStay ? 'Free for stay' : room.occupancy}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-hms-muted">
                    Floor {room.floor} · {room.type} · {formatMoney(room.ratePerNight)}/night
                  </p>
                  <p className="mt-1 text-xs text-hms-muted">
                    Housekeeping: {housekeepingLabels[room.housekeepingStatus]}
                  </p>
                  {inHouseStay && balanceDue > 0 ? (
                    <p className="mt-2 inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                      {inHouseStay.guestName} owes {formatMoney(balanceDue)}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs font-medium text-hms-navy/70 group-hover:text-hms-navy">
                    {freeForStay ? 'View & reserve →' : 'View details →'}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedRoom ? (
        <RoomDetailModal
          room={selectedRoom}
          reservations={reservations}
          stayCheckIn={checkInFilter}
          stayCheckOut={checkOutFilter}
          isReserving={isReserving}
          onClose={() => setSelectedRoom(null)}
          onReserve={async (input) => {
            await onReserve(input)
            setSelectedRoom(null)
          }}
        />
      ) : null}
    </>
  )
}
