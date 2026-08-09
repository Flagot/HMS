import { formatMoney } from '../../utils/money'
import type { ManagerOverview } from '../../types/manager'

type ManagerRevenuePanelsProps = {
  overview: ManagerOverview
}

export function ManagerRevenuePanels({ overview }: ManagerRevenuePanelsProps) {
  const { stays, fnb } = overview

  return (
    <section className="mb-8 grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-hms-navy">
          Stay income
        </h2>
        <p className="mt-1 text-sm text-hms-muted">
          Occupied rooms on {overview.date} — billed stay totals and collections.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-3">
            <dt className="text-xs uppercase tracking-wide text-hms-muted">Occupied</dt>
            <dd className="mt-1 text-xl font-semibold text-hms-navy">
              {stays.occupiedRooms}
            </dd>
            <p className="mt-1 text-xs text-hms-muted">
              {stays.occupiedFullyPaid} paid · {stays.occupiedUnpaidOrPartial} unpaid/partial
            </p>
          </div>
          <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-3">
            <dt className="text-xs uppercase tracking-wide text-hms-muted">Total billed</dt>
            <dd className="mt-1 text-xl font-semibold text-hms-navy">
              {formatMoney(stays.totalBilled)}
            </dd>
            <p className="mt-1 text-xs text-hms-muted">
              Tonight {formatMoney(stays.todayNightValue)}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-3">
            <dt className="text-xs uppercase tracking-wide text-emerald-800/80">Collected</dt>
            <dd className="mt-1 text-xl font-semibold text-emerald-900">
              {formatMoney(stays.totalPaid)}
            </dd>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-3">
            <dt className="text-xs uppercase tracking-wide text-amber-900/80">Balance due</dt>
            <dd className="mt-1 text-xl font-semibold text-amber-950">
              {formatMoney(stays.totalBalanceDue)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-hms-navy">
          Food &amp; beverage
        </h2>
        <p className="mt-1 text-sm text-hms-muted">
          Orders created on {overview.date} (order totals, not separate payments).
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-3">
            <dt className="text-xs uppercase tracking-wide text-hms-muted">Orders</dt>
            <dd className="mt-1 text-xl font-semibold text-hms-navy">{fnb.orderCount}</dd>
            <p className="mt-1 text-xs text-hms-muted">{fnb.servedCount} served</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-3">
            <dt className="text-xs uppercase tracking-wide text-emerald-800/80">Revenue</dt>
            <dd className="mt-1 text-xl font-semibold text-emerald-900">
              {formatMoney(fnb.revenueTotal)}
            </dd>
          </div>
          <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-3 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-hms-muted">By type</dt>
            <dd className="mt-2 flex flex-wrap gap-3 text-sm text-hms-navy">
              <span>Table {fnb.byType.table}</span>
              <span className="text-hms-border">·</span>
              <span>Room service {fnb.byType.room_service}</span>
            </dd>
            <dt className="mt-3 text-xs uppercase tracking-wide text-hms-muted">By status</dt>
            <dd className="mt-2 flex flex-wrap gap-3 text-sm text-hms-navy">
              <span>Pending {fnb.byStatus.pending}</span>
              <span>Preparing {fnb.byStatus.preparing}</span>
              <span>Ready {fnb.byStatus.ready}</span>
              <span>Served {fnb.byStatus.served}</span>
            </dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-hms-border pt-3 text-sm text-hms-muted">
          Combined (stay paid + F&amp;B orders):{' '}
          <span className="font-semibold text-hms-navy">
            {formatMoney(overview.combinedRevenue)}
          </span>
        </p>
      </div>
    </section>
  )
}
