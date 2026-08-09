import type { PaymentStatus } from '../../types/reservation'

const styles: Record<PaymentStatus, string> = {
  unpaid: 'bg-amber-50 text-amber-900 border-amber-200',
  partial: 'bg-sky-50 text-sky-900 border-sky-200',
  paid: 'bg-emerald-50 text-emerald-900 border-emerald-200',
}

const labels: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
}

type PaymentStatusBadgeProps = {
  status: PaymentStatus
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
