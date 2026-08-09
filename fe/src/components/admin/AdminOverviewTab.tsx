import { formatMoney } from '../../utils/money'
import {
  roomStatusLabel,
  roomTypeLabel,
  type AdminOverview,
} from '../../types/admin'

type AdminOverviewTabProps = {
  overview: AdminOverview
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-hms-border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-hms-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-hms-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-hms-muted">{hint}</p> : null}
    </div>
  )
}

export function AdminOverviewTab({ overview }: AdminOverviewTabProps) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Rooms"
          value={String(overview.rooms.total)}
          hint={overview.rooms.byType
            .map((row) => `${roomTypeLabel(row.type)} ${row.count}`)
            .join(' · ')}
        />
        <StatCard
          label="Active stays"
          value={String(overview.reservations.checkedIn)}
          hint={`${overview.reservations.reserved} reserved · ${overview.reservations.total} total`}
        />
        <StatCard
          label="Open F&B orders"
          value={String(
            overview.orders.pending +
              overview.orders.preparing +
              overview.orders.ready,
          )}
          hint={`${overview.orders.served} served · ${overview.orders.total} total`}
        />
        <StatCard
          label="Menu items"
          value={String(overview.menu.total)}
          hint={`${overview.menu.available} available · ${overview.menu.unavailable} off`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Housekeeping snapshot
          </h3>
          <ul className="mt-4 space-y-2">
            {overview.rooms.byStatus.length === 0 ? (
              <li className="text-sm text-hms-muted">No rooms configured.</li>
            ) : (
              overview.rooms.byStatus.map((row) => (
                <li
                  key={row.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-hms-muted">
                    {roomStatusLabel(row.status)}
                  </span>
                  <span className="font-semibold text-hms-navy">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Operations pulse
          </h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-hms-muted">Expense records</dt>
              <dd className="mt-0.5 font-semibold text-hms-navy">
                {overview.expenses.count} ·{' '}
                {formatMoney(overview.expenses.totalAmount)}
              </dd>
            </div>
            <div>
              <dt className="text-hms-muted">Store catalog</dt>
              <dd className="mt-0.5 font-semibold text-hms-navy">
                {overview.store.totalItems} items
              </dd>
            </div>
            <div>
              <dt className="text-hms-muted">Low stock alerts</dt>
              <dd className="mt-0.5 font-semibold text-hms-navy">
                {overview.store.lowStockCount}
              </dd>
            </div>
            <div>
              <dt className="text-hms-muted">Store value</dt>
              <dd className="mt-0.5 font-semibold text-hms-navy">
                {formatMoney(overview.store.totalStockValue)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-hms-muted">
            Finance detail lives in Manager; stock movements in Store Manager.
          </p>
        </section>
      </div>
    </div>
  )
}
