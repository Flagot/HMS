import { formatMoney } from '../../utils/money'
import type { ManagerIncomeDetail } from '../../types/manager'

type ManagerIncomeTabProps = {
  detail: ManagerIncomeDetail | null
  loading?: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function ManagerIncomeTab({ detail, loading = false }: ManagerIncomeTabProps) {
  if (loading && !detail) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading income…
      </p>
    )
  }

  if (!detail) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Income detail unavailable.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Total income', detail.totals.totalIncome],
          ['Rooms accrued', detail.totals.roomsAccrued],
          ['Rooms collected', detail.totals.roomsCollected],
          ['F&B revenue', detail.totals.fnbRevenue],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-hms-border bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-hms-muted">{label}</p>
            <p className="mt-1 text-xl font-semibold text-hms-navy">
              {formatMoney(value as number)}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Room reservations
        </h3>
        <p className="mt-1 text-sm text-hms-muted">
          Stays that overlap this period, with nights accrued in-range.
        </p>
        {detail.stays.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead>
                <tr className="border-b border-hms-border text-xs uppercase tracking-wide text-hms-muted">
                  <th className="px-2 py-2 font-medium">Guest</th>
                  <th className="px-2 py-2 font-medium">Room</th>
                  <th className="px-2 py-2 font-medium">Stay</th>
                  <th className="px-2 py-2 font-medium">Accrued</th>
                  <th className="px-2 py-2 font-medium">Paid</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.stays.map((stay) => (
                  <tr key={stay.id} className="border-b border-hms-border/70 last:border-0">
                    <td className="px-2 py-2.5">
                      <p className="font-medium text-hms-navy">{stay.guestName}</p>
                      <p className="text-xs text-hms-muted">{stay.confirmationCode}</p>
                    </td>
                    <td className="px-2 py-2.5 text-hms-navy">
                      {stay.roomNumber ? `Room ${stay.roomNumber}` : '—'}
                      <span className="block text-xs capitalize text-hms-muted">
                        {stay.roomType}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-hms-muted">
                      {formatDate(stay.checkInDate)} → {formatDate(stay.checkOutDate)}
                      <span className="block text-xs">
                        {stay.nightsInPeriod}/{stay.nights} nights in period
                      </span>
                    </td>
                    <td className="px-2 py-2.5 font-medium text-hms-navy">
                      {formatMoney(stay.accruedInPeriod)}
                    </td>
                    <td className="px-2 py-2.5 text-hms-navy">
                      {formatMoney(stay.amountPaid)}
                      {stay.balanceDue > 0 ? (
                        <span className="block text-xs text-amber-800">
                          due {formatMoney(stay.balanceDue)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2.5 capitalize text-hms-muted">
                      {stay.status.replace('_', ' ')}
                      <span className="block text-xs">{stay.paymentStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-hms-muted">No overlapping stays in this period.</p>
        )}
      </section>

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Food sold
        </h3>
        {detail.foodItems.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-hms-border text-xs uppercase tracking-wide text-hms-muted">
                  <th className="px-2 py-2 font-medium">Item</th>
                  <th className="px-2 py-2 font-medium">Qty</th>
                  <th className="px-2 py-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {detail.foodItems.map((item) => (
                  <tr
                    key={item.menuItemId}
                    className="border-b border-hms-border/70 last:border-0"
                  >
                    <td className="px-2 py-2.5 text-hms-navy">{item.name}</td>
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
          <p className="mt-4 text-sm text-hms-muted">No food items sold in this period.</p>
        )}
      </section>
    </div>
  )
}
