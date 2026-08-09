import type { Order, OrderStatus } from '../../types/order'
import { OrderStatusBadge } from '../waiter/OrderStatusBadge'

type KitchenOrderCardProps = {
  order: Order
  isUpdating?: boolean
  onStatusChange: (orderId: string, status: Extract<OrderStatus, 'preparing' | 'ready'>) => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function nextKitchenAction(
  status: OrderStatus,
): { label: string; next: 'preparing' | 'ready' } | null {
  if (status === 'pending') return { label: 'Start Preparing', next: 'preparing' }
  if (status === 'preparing') return { label: 'Mark Ready', next: 'ready' }
  return null
}

export function KitchenOrderCard({
  order,
  isUpdating = false,
  onStatusChange,
}: KitchenOrderCardProps) {
  const action = nextKitchenAction(order.status)

  return (
    <article className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-hms-navy">
            {order.orderNumber}
          </p>
          <p className="mt-1 text-sm text-hms-muted">
            {order.type === 'table' ? 'Table' : 'Room'} {order.location}
            <span className="mx-1.5 text-hms-border">·</span>
            Updated {formatTime(order.updatedAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="mt-4 space-y-2 border-t border-hms-border pt-4">
        {order.items.map((item) => (
          <li
            key={item.menuItemId}
            className="flex items-center justify-between gap-3 text-sm text-hms-navy"
          >
            <span>
              <span className="font-semibold">{item.quantity}×</span> {item.name}
            </span>
          </li>
        ))}
      </ul>

      {order.note ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Note: {order.note}
        </p>
      ) : null}

      <div className="mt-4 flex justify-end">
        {action ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onStatusChange(order.id, action.next)}
            className="rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-hms-navy-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? 'Updating…' : action.label}
          </button>
        ) : (
          <span className="text-sm text-hms-muted">Waiting for waiter to serve</span>
        )}
      </div>
    </article>
  )
}
