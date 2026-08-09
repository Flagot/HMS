import { categoryLabel, type StoreItemsResult } from '../../types/store'
import { formatMoney } from '../../utils/money'

type StoreLowStockTabProps = {
  result: StoreItemsResult | null
  loading?: boolean
}

export function StoreLowStockTab({
  result,
  loading = false,
}: StoreLowStockTabProps) {
  if (loading && !result) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading low-stock items…
      </p>
    )
  }

  const items = result?.items ?? []

  return (
    <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Low stock alerts
          </h3>
          <p className="mt-1 text-sm text-hms-muted">
            Items at or below their reorder level — prioritize receiving stock.
          </p>
        </div>
        <p className="text-sm text-hms-muted">
          <span className="text-lg font-semibold text-rose-700">{items.length}</span>{' '}
          alerts
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-800">
          All inventory levels are above reorder thresholds.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-hms-border">
          {items.map((item) => {
            const deficit = Math.max(0, item.reorderLevel - item.quantityOnHand)
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-medium text-hms-navy">{item.name}</p>
                  <p className="text-xs text-hms-muted">
                    {item.sku} · {categoryLabel(item.category)} · unit cost{' '}
                    {formatMoney(item.unitCost)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-rose-700">
                    {item.quantityOnHand} {item.unit} on hand
                  </p>
                  <p className="text-xs text-hms-muted">
                    Reorder at {item.reorderLevel}
                    {deficit > 0 ? ` · short by ${deficit}` : ''}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
