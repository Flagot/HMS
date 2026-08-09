import { formatMoney } from '../../utils/money'
import type { ManagerFnbDetail } from '../../types/manager'

type ManagerFnbTabProps = {
  detail: ManagerFnbDetail | null
  loading?: boolean
}

export function ManagerFnbTab({ detail, loading = false }: ManagerFnbTabProps) {
  if (loading && !detail) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading F&amp;B…
      </p>
    )
  }

  if (!detail) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        F&amp;B detail unavailable.
      </p>
    )
  }

  const { summary } = detail

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-hms-border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-hms-muted">Orders</p>
          <p className="mt-1 text-2xl font-semibold text-hms-navy">{summary.orderCount}</p>
        </div>
        <div className="rounded-xl border border-hms-border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-hms-muted">Served</p>
          <p className="mt-1 text-2xl font-semibold text-hms-navy">{summary.servedCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-emerald-800/80">Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-900">
            {formatMoney(summary.revenueTotal)}
          </p>
        </div>
        <div className="rounded-xl border border-hms-border bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-hms-muted">By type</p>
          <p className="mt-1 text-sm text-hms-navy">
            Table {summary.byType.table} · Room {summary.byType.room_service}
          </p>
          <p className="mt-1 text-xs text-hms-muted">
            P {summary.byStatus.pending} · Prep {summary.byStatus.preparing} · Ready{' '}
            {summary.byStatus.ready} · Served {summary.byStatus.served}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Items sold
        </h3>
        <p className="mt-1 text-sm text-hms-muted">
          Aggregated menu items from orders created in this period.
        </p>
        {detail.foodItems.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-hms-border text-xs uppercase tracking-wide text-hms-muted">
                  <th className="px-2 py-2 font-medium">Item</th>
                  <th className="px-2 py-2 font-medium">Qty sold</th>
                  <th className="px-2 py-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {detail.foodItems.map((item) => (
                  <tr
                    key={item.menuItemId}
                    className="border-b border-hms-border/70 last:border-0"
                  >
                    <td className="px-2 py-2.5 font-medium text-hms-navy">{item.name}</td>
                    <td className="px-2 py-2.5 text-hms-muted">{item.quantity}</td>
                    <td className="px-2 py-2.5 font-medium text-hms-navy">
                      {formatMoney(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-hms-muted">No items sold in this period.</p>
        )}
      </section>
    </div>
  )
}
