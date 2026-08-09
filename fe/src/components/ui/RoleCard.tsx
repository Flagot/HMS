import { Link } from 'react-router-dom'
import type { StaffRole } from '../../types/role'
import { RoleIcon } from './RoleIcon'

const availableRoutes = new Set([
  '/housekeeping',
  '/waiter',
  '/kitchen',
  '/reception',
  '/manager',
  '/store',
])


const accentStyles: Record<StaffRole['accent'], string> = {
  navy: 'bg-hms-navy/10 text-hms-navy ring-hms-navy/20',
  gold: 'bg-hms-gold/15 text-hms-gold-dark ring-hms-gold/30',
  teal: 'bg-hms-teal/10 text-hms-teal ring-hms-teal/20',
  slate: 'bg-hms-slate/10 text-hms-slate ring-hms-slate/20',
  amber: 'bg-amber-100 text-amber-800 ring-amber-200',
  rose: 'bg-rose-100 text-rose-800 ring-rose-200',
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
}

type RoleCardProps = {
  role: StaffRole
}

export function RoleCard({ role }: RoleCardProps) {
  const accent = accentStyles[role.accent]
  const isAvailable = availableRoutes.has(role.path)

  return (
    <article className="group flex flex-col rounded-xl border border-hms-border bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-hms-gold/40 hover:shadow-md">
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ring-1 ${accent}`}
      >
        <RoleIcon roleId={role.id} />
      </div>

      <h2 className="font-display text-xl font-semibold text-hms-navy">{role.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-hms-muted">
        {role.description}
      </p>

      {isAvailable ? (
        <Link
          to={role.path}
          className="mt-5 block w-full rounded-lg border border-hms-border bg-hms-cream px-4 py-2.5 text-center text-sm font-medium text-hms-navy transition-colors group-hover:border-hms-navy group-hover:bg-hms-navy group-hover:text-white"
        >
          Enter Portal
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-5 w-full rounded-lg border border-hms-border bg-hms-cream px-4 py-2.5 text-sm font-medium text-hms-muted disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Open ${role.title} portal — coming soon`}
        >
          Enter Portal
          <span className="ml-1 text-xs opacity-70">(coming soon)</span>
        </button>
      )}
    </article>
  )
}
