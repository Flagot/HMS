type QueueStatCardProps = {
  label: string
  count: number
  active: boolean
  onClick: () => void
  accent?: 'default' | 'pending' | 'preparing' | 'ready'
}

const accentStyles = {
  default: 'border-hms-border',
  pending: 'border-amber-200',
  preparing: 'border-sky-200',
  ready: 'border-emerald-200',
}

export function QueueStatCard({
  label,
  count,
  active,
  onClick,
  accent = 'default',
}: QueueStatCardProps) {
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
