import type { Order, OrderStatus } from '../../types/order'
import { formatMoney } from '../../utils/money'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderTotals } from './OrderTotals'

const typeLabels = {
  table: 'Table',
  room_service: 'Room Service',
}

type OrderRowProps = {
  order: Order
  isUpdating?: boolean
  onStatusChange: (orderId: string, status: OrderStatus) => void
  onEdit: (orderId: string) => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function nextAction(status: OrderStatus): { label: string; next: OrderStatus } | null {
  if (status === 'pending') return { label: 'Send to Kitchen', next: 'preparing' }
  if (status === 'preparing') return { label: 'Mark Ready', next: 'ready' }
  if (status === 'ready') return { label: 'Mark Served', next: 'served' }
  return null
}

export function OrderRow({
  order,
  isUpdating = false,
  onStatusChange,
  onEdit,
}: OrderRowProps) {
  const action = nextAction(order.status)
  const canEdit = order.status !== 'served'

  return (
    <tr className="border-b border-hms-border last:border-0 hover:bg-hms-cream/50">
      <td className="px-4 py-4 font-medium text-hms-navy">{order.orderNumber}</td>
      <td className="px-4 py-4 text-sm text-hms-muted">
        <span className="font-medium text-hms-navy">{typeLabels[order.type]}</span>
        <span className="mt-0.5 block">{order.location}</span>
      </td>
      <td className="px-4 py-4 text-sm text-hms-navy">
        <ul className="space-y-1">
          {order.items.map((item) => (
            <li key={item.menuItemId}>
              {item.quantity}× {item.name}
              <span className="ml-1 text-xs text-hms-muted">
                ({formatMoney(item.lineTotal)})
              </span>
            </li>
          ))}
        </ul>
      </td>
      <td className="px-4 py-4">
        <OrderTotals
          subtotal={order.subtotal}
          tax={order.tax}
          serviceCharge={order.serviceCharge}
          total={order.total}
          taxRate={order.taxRate}
          serviceChargeRate={order.serviceChargeRate}
          compact
        />
      </td>
      <td className="px-4 py-4">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="hidden px-4 py-4 text-sm text-hms-muted lg:table-cell">
        {order.note ?? '—'}
      </td>
      <td className="hidden px-4 py-4 text-sm text-hms-muted sm:table-cell">
        {formatTime(order.updatedAt)}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canEdit ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onEdit(order.id)}
              className="rounded-lg border border-hms-border px-3 py-1.5 text-xs font-medium text-hms-navy transition-colors hover:bg-hms-cream disabled:cursor-not-allowed disabled:opacity-60"
            >
              Edit
            </button>
          ) : null}
          {action ? (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onStatusChange(order.id, action.next)}
              className="rounded-lg bg-hms-navy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-hms-navy-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? 'Updating…' : action.label}
            </button>
          ) : (
            <span className="text-xs text-hms-muted">Complete</span>
          )}
        </div>
      </td>
    </tr>
  )
}
