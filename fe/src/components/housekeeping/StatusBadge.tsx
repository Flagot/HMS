import type { RoomStatus } from '../../types/room'

const statusConfig: Record<
  RoomStatus,
  { label: string; className: string }
> = {
  dirty: {
    label: 'Needs Cleaning',
    className: 'bg-red-100 text-red-800 ring-red-200',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-amber-100 text-amber-800 ring-amber-200',
  },
  clean: {
    label: 'Clean',
    className: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  },
  inspect: {
    label: 'Needs Inspection',
    className: 'bg-violet-100 text-violet-800 ring-violet-200',
  },
}

type StatusBadgeProps = {
  status: RoomStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
