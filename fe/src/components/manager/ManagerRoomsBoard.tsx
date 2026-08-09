import { formatMoney } from '../../utils/money'
import type { ManagerRoom } from '../../types/manager'

type ManagerRoomsBoardProps = {
  rooms: ManagerRoom[]
  loading?: boolean
}

const occupancyStyles = {
  vacant: 'bg-slate-50 text-slate-700 border-slate-200',
  reserved: 'bg-sky-50 text-sky-900 border-sky-200',
  occupied: 'bg-emerald-50 text-emerald-900 border-emerald-200',
}

const hkStyles = {
  dirty: 'text-amber-800',
  in_progress: 'text-sky-800',
  clean: 'text-emerald-800',
  inspect: 'text-violet-800',
}

export function ManagerRoomsBoard({ rooms, loading = false }: ManagerRoomsBoardProps) {
  if (loading && rooms.length === 0) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading rooms…
      </p>
    )
  }

  return (
    <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-hms-navy">Room snapshot</h2>
      <p className="mt-1 text-sm text-hms-muted">
        Occupancy and housekeeping status across the property (read-only).
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-hms-border text-xs uppercase tracking-wide text-hms-muted">
              <th className="px-2 py-2 font-medium">Room</th>
              <th className="px-2 py-2 font-medium">Type</th>
              <th className="px-2 py-2 font-medium">Occupancy</th>
              <th className="px-2 py-2 font-medium">Housekeeping</th>
              <th className="px-2 py-2 font-medium">Rate</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-hms-border/70 last:border-0">
                <td className="px-2 py-2.5 font-medium text-hms-navy">
                  {room.number}
                  <span className="ml-1.5 text-xs font-normal text-hms-muted">
                    Fl. {room.floor}
                  </span>
                </td>
                <td className="px-2 py-2.5 capitalize text-hms-muted">{room.type}</td>
                <td className="px-2 py-2.5">
                  <span
                    className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${occupancyStyles[room.occupancy]}`}
                  >
                    {room.occupancy.replace('_', ' ')}
                  </span>
                </td>
                <td className={`px-2 py-2.5 capitalize ${hkStyles[room.housekeepingStatus]}`}>
                  {room.housekeepingStatus.replace('_', ' ')}
                </td>
                <td className="px-2 py-2.5 text-hms-navy">
                  {formatMoney(room.ratePerNight)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
