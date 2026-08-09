type ReceptionStatCardProps = {
  label: string
  count: number
  active: boolean
  onClick: () => void
  accent?: 'default' | 'reserved' | 'checked_in' | 'checked_out' | 'cancelled'
}

const accentStyles = {
  default: 'border-hms-border',
  reserved: 'border-sky-200',
  checked_in: 'border-emerald-200',
  checked_out: 'border-slate-200',
  cancelled: 'border-red-200',
}

export function ReceptionStatCard({
  label,
  count,
  active,
  onClick,
  accent = 'default',
}: ReceptionStatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md ${
        active ? 'border-hms-navy ring-2 ring-hms-navy/20' : accentStyles[accent]
      }`}
    >
      <p className="text-2xl font-semibold text-hms-navy">{count}</p>
      <p className="mt-1 text-sm text-hms-muted">{label}</p>
    </button>
  )
}
