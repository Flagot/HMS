type StatCardProps = {
  label: string
  count: number
  active: boolean
  onClick: () => void
  accent?: 'default' | 'dirty' | 'progress' | 'clean' | 'inspect'
}

const accentStyles = {
  default: 'border-hms-border',
  dirty: 'border-red-200',
  progress: 'border-amber-200',
  clean: 'border-emerald-200',
  inspect: 'border-violet-200',
}

export function StatCard({ label, count, active, onClick, accent = 'default' }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md ${
        active
          ? 'border-hms-navy ring-2 ring-hms-navy/20'
          : accentStyles[accent]
      }`}
    >
      <p className="text-2xl font-semibold text-hms-navy">{count}</p>
      <p className="mt-1 text-sm text-hms-muted">{label}</p>
    </button>
  )
}
