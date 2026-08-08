import { useMemo, useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { RoomRow } from '../components/housekeeping/RoomRow'
import { StatCard } from '../components/housekeeping/StatCard'
import { initialRooms } from '../data/rooms'
import type { Room, RoomStatus } from '../types/room'

type FilterValue = 'all' | RoomStatus

export function HousekeepingPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [filter, setFilter] = useState<FilterValue>('all')

  const counts = useMemo(() => {
    return rooms.reduce(
      (acc, room) => {
        acc[room.status] += 1
        return acc
      },
      { dirty: 0, in_progress: 0, clean: 0, inspect: 0 },
    )
  }, [rooms])

  const filteredRooms = useMemo(() => {
    const list =
      filter === 'all' ? rooms : rooms.filter((room) => room.status === filter)
    return [...list].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
  }, [rooms, filter])

  function handleStatusChange(roomId: string, status: RoomStatus) {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? { ...room, status, updatedAt: new Date().toISOString(), note: undefined }
          : room,
      ),
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        roleLabel="Housekeeping"
        title="Room Status Board"
        subtitle="Track cleaning progress across all floors. Update room status as you work through your shift."
      />

      <section aria-label="Room status summary" className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="All Rooms"
          count={rooms.length}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <StatCard
          label="Needs Cleaning"
          count={counts.dirty}
          active={filter === 'dirty'}
          onClick={() => setFilter('dirty')}
          accent="dirty"
        />
        <StatCard
          label="In Progress"
          count={counts.in_progress}
          active={filter === 'in_progress'}
          onClick={() => setFilter('in_progress')}
          accent="progress"
        />
        <StatCard
          label="Clean"
          count={counts.clean}
          active={filter === 'clean'}
          onClick={() => setFilter('clean')}
          accent="clean"
        />
        <StatCard
          label="Inspection"
          count={counts.inspect}
          active={filter === 'inspect'}
          onClick={() => setFilter('inspect')}
          accent="inspect"
        />
      </section>

      <section
        aria-label="Room list"
        className="overflow-hidden rounded-xl border border-hms-border bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-b border-hms-border bg-hms-cream/60">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                  Room
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted sm:table-cell">
                  Floor
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted md:table-cell">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted lg:table-cell">
                  Note
                </th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted sm:table-cell">
                  Updated
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <RoomRow key={room.id} room={room} onStatusChange={handleStatusChange} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-hms-muted">
                    No rooms match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
