import { formatMoney, formatPercent } from '../../utils/money'

type OrderTotalsProps = {
  subtotal: number
  tax: number
  serviceCharge: number
  total: number
  taxRate: number
  serviceChargeRate: number
  compact?: boolean
}

export function OrderTotals({
  subtotal,
  tax,
  serviceCharge,
  total,
  taxRate,
  serviceChargeRate,
  compact = false,
}: OrderTotalsProps) {
  if (compact) {
    return (
      <div className="text-right text-sm">
        <p className="font-semibold text-hms-navy">{formatMoney(total)}</p>
        <p className="text-xs text-hms-muted">incl. tax & service</p>
      </div>
    )
  }

  return (
    <dl className="space-y-1.5 rounded-lg border border-hms-border bg-hms-cream/40 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-4 text-hms-muted">
        <dt>Subtotal</dt>
        <dd className="text-hms-navy">{formatMoney(subtotal)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 text-hms-muted">
        <dt>Tax ({formatPercent(taxRate)})</dt>
        <dd className="text-hms-navy">{formatMoney(tax)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 text-hms-muted">
        <dt>Service charge ({formatPercent(serviceChargeRate)})</dt>
        <dd className="text-hms-navy">{formatMoney(serviceCharge)}</dd>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-hms-border pt-2 font-semibold text-hms-navy">
        <dt>Total</dt>
        <dd>{formatMoney(total)}</dd>
      </div>
    </dl>
  )
}
