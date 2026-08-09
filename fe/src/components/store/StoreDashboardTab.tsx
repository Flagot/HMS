import {
  categoryLabel,
  departmentLabel,
  movementTypeLabel,
  type StockMovement,
  type StoreItem,
  type StoreOverview,
} from '../../types/store'
import { formatMoney } from '../../utils/money'
import { StoreKpiStrip } from './StoreKpiStrip'

type StoreDashboardTabProps = {
  overview: StoreOverview
}

function formatWhen(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LowStockRow({ item }: { item: StoreItem }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-hms-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-hms-navy">{item.name}</p>
        <p className="text-xs text-hms-muted">
          {item.sku} · {categoryLabel(item.category)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-rose-700">
          {item.quantityOnHand} {item.unit}
        </p>
        <p className="text-xs text-hms-muted">Reorder at {item.reorderLevel}</p>
      </div>
    </li>
  )
}

function MovementRow({ movement }: { movement: StockMovement }) {
  const isIssue = movement.type === 'issue'
  const isReceive = movement.type === 'receive'
  const qtyClass = isIssue
    ? 'text-rose-700'
    : isReceive
      ? 'text-emerald-700'
      : 'text-hms-navy'

  return (
    <li className="flex items-start justify-between gap-3 border-b border-hms-border py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-hms-navy">{movement.itemName}</p>
        <p className="text-xs text-hms-muted">
          {movementTypeLabel(movement.type)}
          {movement.department ? ` · ${departmentLabel(movement.department)}` : ''}
          {' · '}
          {formatWhen(movement.createdAt)}
        </p>
      </div>
      <p className={`text-sm font-semibold tabular-nums ${qtyClass}`}>
        {movement.quantity > 0 ? '+' : ''}
        {movement.quantity}
      </p>
    </li>
  )
}

export function StoreDashboardTab({ overview }: StoreDashboardTabProps) {
  return (
    <div className="space-y-6">
      <StoreKpiStrip overview={overview} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Low stock alerts
          </h3>
          <p className="mt-1 text-sm text-hms-muted">
            Items at or below reorder level.
          </p>
          {overview.lowStockItems.length === 0 ? (
            <p className="mt-6 text-sm text-hms-muted">No low-stock items right now.</p>
          ) : (
            <ul className="mt-4">
              {overview.lowStockItems.map((item) => (
                <LowStockRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Recent movements
          </h3>
          <p className="mt-1 text-sm text-hms-muted">
            Latest receive, issue, and adjust activity.
          </p>
          {overview.recentMovements.length === 0 ? (
            <p className="mt-6 text-sm text-hms-muted">No stock movements yet.</p>
          ) : (
            <ul className="mt-4">
              {overview.recentMovements.map((movement) => (
                <MovementRow key={movement.id} movement={movement} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {overview.categoryCounts.length > 0 ? (
        <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Catalog by category
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {overview.categoryCounts.map((row) => (
              <span
                key={row.category}
                className="rounded-lg border border-hms-border bg-hms-cream/60 px-3 py-1.5 text-sm text-hms-navy"
              >
                {categoryLabel(row.category)}{' '}
                <span className="font-semibold">{row.count}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-hms-muted">
            Inventory value on hand: {formatMoney(overview.totalStockValue)}
          </p>
        </section>
      ) : null}
    </div>
  )
}
