import type { ReservationStatus } from '../../types/reservation'

const statusConfig: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  reserved: {
    label: 'Reserved',
    className: 'bg-sky-100 text-sky-800 ring-sky-200',
  },
  checked_in: {
    label: 'Checked in',
    className: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  },
  checked_out: {
    label: 'Checked out',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 ring-red-200',
  },
}

type ReservationStatusBadgeProps = {
  status: ReservationStatus
}

export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
