import { formatMoney } from '../../utils/money'
import type { ManagerAnalytics } from '../../types/manager'
import { IncomeExpenseChart, IncomeSourceChart } from './ManagerCharts'

type ManagerDashboardTabProps = {
  analytics: ManagerAnalytics
}

export function ManagerDashboardTab({ analytics }: ManagerDashboardTabProps) {
  const cards = [
    {
      label: 'Total income',
      value: formatMoney(analytics.income.total),
      hint: `${analytics.income.reservationCount} stays · ${analytics.income.orderCount} orders`,
      tone: 'default' as const,
    },
    {
      label: 'Total expenses',
      value: formatMoney(analytics.expenses.total),
      hint: `${analytics.expenses.count} entries`,
      tone: 'amber' as const,
    },
    {
      label: 'Net',
      value: formatMoney(analytics.net),
      hint: analytics.net >= 0 ? 'Income after expenses' : 'Expenses exceed income',
      tone: analytics.net >= 0 ? ('emerald' as const) : ('rose' as const),
    },
    {
      label: 'Occupied now',
      value: String(analytics.rooms.occupied),
      hint: `${analytics.rooms.vacant} vacant · ${analytics.rooms.reserved} reserved`,
      tone: 'default' as const,
    },
  ]

  const toneClass = {
    default: 'border-hms-border bg-white',
    amber: 'border-amber-200 bg-amber-50/50',
    emerald: 'border-emerald-200 bg-emerald-50/50',
    rose: 'border-rose-200 bg-rose-50/50',
  }

  return (
    <div>
      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-4 shadow-sm ${toneClass[card.tone]}`}
          >
            <p className="text-xs uppercase tracking-wide text-hms-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-hms-navy">{card.value}</p>
            <p className="mt-1 text-xs text-hms-muted">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <IncomeExpenseChart series={analytics.series} />
        </div>
        <div className="lg:col-span-2">
          <IncomeSourceChart slices={analytics.incomeBySource} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Income breakdown
          </h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-hms-muted">Room stays (accrued nights)</dt>
              <dd className="font-medium text-hms-navy">
                {formatMoney(analytics.income.roomsAccrued)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-hms-muted">Room collections (on books)</dt>
              <dd className="font-medium text-hms-navy">
                {formatMoney(analytics.income.roomsCollected)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-hms-muted">Food &amp; beverage</dt>
              <dd className="font-medium text-hms-navy">
                {formatMoney(analytics.income.fnbRevenue)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Top food items
          </h3>
          {analytics.topFoodItems.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {analytics.topFoodItems.map((item) => (
                <li
                  key={item.menuItemId}
                  className="flex items-center justify-between gap-3 border-b border-hms-border/60 py-2 last:border-0"
                >
                  <span className="text-hms-navy">
                    {item.name}
                    <span className="ml-2 text-xs text-hms-muted">×{item.quantity}</span>
                  </span>
                  <span className="font-medium text-hms-navy">
                    {formatMoney(item.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-hms-muted">No F&amp;B sales in this period.</p>
          )}
        </div>
      </section>
    </div>
  )
}
