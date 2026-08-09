import { formatMoney } from '../../utils/money'
import type { IncomeSummary } from '../../types/reservation'

type DailyIncomePanelProps = {
  summary: IncomeSummary | null
  loading?: boolean
}

export function DailyIncomePanel({ summary, loading = false }: DailyIncomePanelProps) {
  return (
    <section className="mb-8 rounded-xl border border-hms-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-hms-navy">
            Today&apos;s income
          </h2>
          <p className="mt-1 text-sm text-hms-muted">
            Occupied rooms for {summary?.date ?? 'today'} — billed stay totals and
            what has been collected.
          </p>
        </div>
      </div>

      {loading && !summary ? (
        <p className="mt-4 text-sm text-hms-muted">Loading income…</p>
      ) : summary ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-hms-muted">Occupied</p>
            <p className="mt-1 text-2xl font-semibold text-hms-navy">
              {summary.occupiedRooms}
            </p>
            <p className="mt-1 text-xs text-hms-muted">
              {summary.occupiedFullyPaid} paid · {summary.occupiedUnpaidOrPartial}{' '}
              unpaid/partial
            </p>
          </div>
          <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-hms-muted">
              Total billed (stays)
            </p>
            <p className="mt-1 text-2xl font-semibold text-hms-navy">
              {formatMoney(summary.totalBilled)}
            </p>
            <p className="mt-1 text-xs text-hms-muted">
              All nights for currently occupied rooms
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-emerald-800/80">
              Collected
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-900">
              {formatMoney(summary.totalPaid)}
            </p>
            <p className="mt-1 text-xs text-emerald-800/70">
              Night value today {formatMoney(summary.todayNightValue)}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-amber-900/80">
              Balance due
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-950">
              {formatMoney(summary.totalBalanceDue)}
            </p>
            <p className="mt-1 text-xs text-amber-900/70">
              Still outstanding from occupied rooms
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-hms-muted">Income summary unavailable.</p>
      )}
    </section>
  )
}
