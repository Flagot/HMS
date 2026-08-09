import { formatMoney } from '../../utils/money'
import type { StoreOverview } from '../../types/store'

type StoreKpiStripProps = {
  overview: StoreOverview
}

export function StoreKpiStrip({ overview }: StoreKpiStripProps) {
  const items = [
    {
      label: 'Catalog items',
      value: String(overview.totalItems),
      hint: `${overview.categoryCounts.length} categories in use`,
    },
    {
      label: 'Stock value',
      value: formatMoney(overview.totalStockValue),
      hint: 'Based on unit cost × qty',
    },
    {
      label: 'Low stock',
      value: String(overview.lowStockCount),
      hint: overview.lowStockCount > 0 ? 'Needs reorder attention' : 'All levels healthy',
    },
    {
      label: 'Today’s moves',
      value: String(overview.movementsToday),
      hint: `+${overview.receivedToday} in · ${overview.issuedToday} out`,
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
