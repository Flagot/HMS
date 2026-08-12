import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  assignReservationRoom,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  createReservation,
  fetchIncomeSummary,
  fetchReceptionRooms,
  fetchReservations,
  updateReservationPayment,
} from '../api/reception'
import { RolePageLayout } from '../components/layout/RolePageLayout'
import { DailyIncomePanel } from '../components/reception/DailyIncomePanel'
import { ReceptionStatCard } from '../components/reception/ReceptionStatCard'
import { ReservationCard } from '../components/reception/ReservationCard'
import { RoomsBoard } from '../components/reception/RoomsBoard'
import { useNotifications } from '../notifications/NotificationContext'
import { stayDueStatus } from '../utils/stayAvailability'
import type {
  CreateReservationInput,
  IncomeSummary,
  ReceptionRoom,
  Reservation,
  ReservationStatus,
} from '../types/reservation'

type ReceptionTab = 'rooms' | 'stays'
type StayFilter = 'all' | 'due_out' | ReservationStatus

export function ReceptionPage() {
  const { pushNotice } = useNotifications()
  const [tab, setTab] = useState<ReceptionTab>('rooms')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [rooms, setRooms] = useState<ReceptionRoom[]>([])
  const [income, setIncome] = useState<IncomeSummary | null>(null)
  const [filter, setFilter] = useState<StayFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const [reservationData, roomData, incomeData] = await Promise.all([
      fetchReservations(),
      fetchReceptionRooms(),
      fetchIncomeSummary(),
    ])
    setReservations(reservationData)
    setRooms(roomData)
    setIncome(incomeData)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      setLoading(true)
      setError(null)
      try {
        await load()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load reception data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void initialLoad()
    return () => {
      cancelled = true
    }
  }, [load])

  const counts = useMemo(() => {
    return reservations.reduce(
      (acc, reservation) => {
        acc[reservation.status] += 1
        return acc
      },
      { reserved: 0, checked_in: 0, checked_out: 0, cancelled: 0 },
    )
  }, [reservations])

  const dueOutStays = useMemo(
    () =>
      reservations.filter(
        (reservation) => stayDueStatus(reservation) !== 'ok',
      ),
    [reservations],
  )
  const overstayCount = useMemo(
    () =>
      dueOutStays.filter(
        (reservation) => stayDueStatus(reservation) === 'overstay',
      ).length,
    [dueOutStays],
  )

  const notifiedOverstayRef = useRef(false)
  useEffect(() => {
    if (loading || notifiedOverstayRef.current || dueOutStays.length === 0) {
      return
    }
    notifiedOverstayRef.current = true
    pushNotice({
      tone: overstayCount > 0 ? 'error' : 'warn',
      title: overstayCount > 0 ? 'Overstay alert' : 'Due out today',
      message:
        overstayCount > 0
          ? `${overstayCount} guest${overstayCount > 1 ? 's' : ''} past their checkout date. Open the Due out filter in Stays.`
          : `${dueOutStays.length} guest${dueOutStays.length > 1 ? 's' : ''} due to check out today.`,
    })
  }, [loading, dueOutStays, overstayCount, pushNotice])

  const filteredReservations = useMemo(() => {
    const list =
      filter === 'all'
        ? reservations
        : filter === 'due_out'
          ? dueOutStays
          : reservations.filter((reservation) => reservation.status === filter)
    return [...list].sort(
      (a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime(),
    )
  }, [reservations, dueOutStays, filter])

  async function refreshQuietly() {
    try {
      await load()
    } catch {
      // Keep current UI.
    }
  }

  async function handleCreate(input: CreateReservationInput) {
    setCreating(true)
    setError(null)
    try {
      const created = await createReservation(input)
      setReservations((prev) => [created, ...prev])
      await refreshQuietly()
      setTab('stays')
      setFilter('reserved')
      pushNotice({
        tone: 'success',
        title: 'Reservation created',
        message: `${created.confirmationCode} for ${created.guestName} · Room ${created.roomNumber} · ${created.paymentStatus}.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation')
      throw err
    } finally {
      setCreating(false)
    }
  }

  async function handleAssign(reservationId: string, roomId: string) {
    setUpdatingId(reservationId)
    setError(null)
    try {
      await assignReservationRoom(reservationId, roomId)
      await refreshQuietly()
      pushNotice({
        tone: 'info',
        title: 'Room assigned',
        message: 'Reservation room assignment updated.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign room')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleUpdatePayment(reservationId: string, amountPaid: number) {
    setUpdatingId(reservationId)
    setError(null)
    try {
      const updated = await updateReservationPayment(reservationId, amountPaid)
      await refreshQuietly()
      pushNotice({
        tone: 'success',
        title: 'Payment updated',
        message: `${updated.guestName}: ${updated.paymentStatus} · paid ${updated.amountPaid.toFixed(2)} ETB.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleCheckIn(reservationId: string, roomId?: string) {
    setUpdatingId(reservationId)
    setError(null)
    try {
      const updated = await checkInReservation(reservationId, roomId)
      await refreshQuietly()
      setFilter('checked_in')
      pushNotice({
        tone: 'success',
        title: 'Guest checked in',
        message: `${updated.guestName} is in room ${updated.roomNumber}.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleCheckOut(reservationId: string) {
    setUpdatingId(reservationId)
    setError(null)
    try {
      const updated = await checkOutReservation(reservationId)
      await refreshQuietly()
      setFilter('checked_out')
      pushNotice({
        tone: 'info',
        title: 'Guest checked out',
        message: `${updated.guestName} checked out. Room sent to housekeeping as dirty.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check out')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleCancel(reservationId: string) {
    setUpdatingId(reservationId)
    setError(null)
    try {
      const updated = await cancelReservation(reservationId)
      await refreshQuietly()
      pushNotice({
        tone: 'warn',
        title: 'Reservation cancelled',
        message: `${updated.confirmationCode} was cancelled.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <RolePageLayout
      roleLabel="Reception"
      title="Front Desk"
      subtitle="Filter and select a room first, reserve it for a guest, then manage check-in and check-out."
      navLabel="Reception views"
      navTitle="Reception menu"
      items={[
        { id: 'rooms', label: 'Rooms' },
        {
          id: 'stays',
          label: 'Stays',
          badge: (
            <>
              {!loading && counts.checked_in > 0 ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                  {counts.checked_in}
                </span>
              ) : null}
              {!loading && dueOutStays.length > 0 ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    overstayCount > 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {overstayCount > 0 ? overstayCount : dueOutStays.length}
                </span>
              ) : null}
            </>
          ),
        },
      ]}
      activeId={tab}
      onSelect={(id) => setTab(id as ReceptionTab)}
      banner={
        error ? (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        ) : null
      }
    >
      <DailyIncomePanel summary={income} loading={loading} />

      {tab === 'rooms' ? (
        <RoomsBoard
          rooms={rooms}
          reservations={reservations}
          loading={loading}
          isReserving={creating}
          onReserve={handleCreate}
        />
      ) : null}

      {tab === 'stays' ? (
        <div>
          <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <ReceptionStatCard
              label="All"
              count={reservations.length}
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <ReceptionStatCard
              label="Reserved"
              count={counts.reserved}
              active={filter === 'reserved'}
              onClick={() => setFilter('reserved')}
              accent="reserved"
            />
            <ReceptionStatCard
              label="Checked in"
              count={counts.checked_in}
              active={filter === 'checked_in'}
              onClick={() => setFilter('checked_in')}
              accent="checked_in"
            />
            <ReceptionStatCard
              label={overstayCount > 0 ? 'Due out / overstay' : 'Due out'}
              count={dueOutStays.length}
              active={filter === 'due_out'}
              onClick={() => setFilter('due_out')}
              accent="due"
              alert={overstayCount > 0}
            />
            <ReceptionStatCard
              label="Checked out"
              count={counts.checked_out}
              active={filter === 'checked_out'}
              onClick={() => setFilter('checked_out')}
              accent="checked_out"
            />
            <ReceptionStatCard
              label="Cancelled"
              count={counts.cancelled}
              active={filter === 'cancelled'}
              onClick={() => setFilter('cancelled')}
              accent="cancelled"
            />
          </section>

          {loading ? (
            <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
              Loading stays…
            </p>
          ) : filteredReservations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  rooms={rooms}
                  reservations={reservations}
                  isUpdating={updatingId === reservation.id}
                  onAssignRoom={handleAssign}
                  onUpdatePayment={handleUpdatePayment}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
              {reservations.length === 0
                ? 'No reservations yet. Open Rooms, select a room, and reserve it.'
                : filter === 'due_out'
                  ? 'No guests are due out or overstaying today.'
                  : 'No stays match this filter.'}
            </p>
          )}
        </div>
      ) : null}
    </RolePageLayout>
  )
}
