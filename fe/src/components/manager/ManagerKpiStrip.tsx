import { formatMoney } from '../../utils/money'
import type { ManagerOverview } from '../../types/manager'

type ManagerKpiStripProps = {
  overview: ManagerOverview
}

export function ManagerKpiStrip({ overview }: ManagerKpiStripProps) {
  const items = [
    {
      label: 'Occupied rooms',
      value: String(overview.rooms.occupied),
      hint: `${overview.rooms.vacant} vacant · ${overview.rooms.reserved} reserved`,
    },
    {
      label: 'Stay collected',
      value: formatMoney(overview.stays.totalPaid),
      hint: `${formatMoney(overview.stays.totalBalanceDue)} still due`,
    },
    {
      label: 'F&B revenue',
      value: formatMoney(overview.fnb.revenueTotal),
      hint: `${overview.fnb.orderCount} orders today`,
    },
    {
      label: 'Rooms needing HK',
      value: String(
        overview.rooms.housekeeping.dirty + overview.rooms.housekeeping.inspect,
      ),
      hint: `${overview.rooms.housekeeping.in_progress} in progress`,
    },
  ]

  return (
    <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-hms-border bg-white p-4 shadow-sm"
        >
          <p className="text-xs uppercase tracking-wide text-hms-muted">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold text-hms-navy">{item.value}</p>
          <p className="mt-1 text-xs text-hms-muted">{item.hint}</p>
        </div>
      ))}
    </section>
  )
}
