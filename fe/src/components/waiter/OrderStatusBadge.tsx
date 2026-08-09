import type { OrderStatus } from '../../types/order'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 ring-amber-200',
  },
  preparing: {
    label: 'Preparing',
    className: 'bg-sky-100 text-sky-800 ring-sky-200',
  },
  ready: {
    label: 'Ready',
    className: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  },
  served: {
    label: 'Served',
    className: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
}

type OrderStatusBadgeProps = {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  )
}
