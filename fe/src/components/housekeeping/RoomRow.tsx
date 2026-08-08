import type { Room, RoomStatus } from '../../types/room'
import { StatusBadge } from './StatusBadge'

const roomTypeLabels = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  suite: 'Suite',
}

type RoomRowProps = {
  room: Room
  isUpdating?: boolean
  onStatusChange: (roomId: string, status: RoomStatus) => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function RoomRow({ room, isUpdating = false, onStatusChange }: RoomRowProps) {
  const action =
    room.status === 'dirty' || room.status === 'inspect'
      ? { label: 'Start Cleaning', next: 'in_progress' as const }
      : room.status === 'in_progress'
        ? { label: 'Mark Clean', next: 'clean' as const }
        : null

  return (
    <tr className="border-b border-hms-border last:border-0 hover:bg-hms-cream/50">
      <td className="px-4 py-4 font-medium text-hms-navy">{room.number}</td>
      <td className="hidden px-4 py-4 text-sm text-hms-muted sm:table-cell">
        Floor {room.floor}
      </td>
      <td className="hidden px-4 py-4 text-sm text-hms-muted md:table-cell">
        {roomTypeLabels[room.type]}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={room.status} />
      </td>
      <td className="hidden px-4 py-4 text-sm text-hms-muted lg:table-cell">
        {room.note ?? '—'}
      </td>
      <td className="hidden px-4 py-4 text-sm text-hms-muted sm:table-cell">
        {formatTime(room.updatedAt)}
      </td>
      <td className="px-4 py-4 text-right">
        {action ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onStatusChange(room.id, action.next)}
            className="rounded-lg bg-hms-navy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-hms-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? 'Updating…' : action.label}
          </button>
        ) : (
          <span className="text-xs text-hms-muted">Ready</span>
        )}
      </td>
    </tr>
  )
}
