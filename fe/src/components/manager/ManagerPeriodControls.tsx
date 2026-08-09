import { formatMoney } from '../../utils/money'
import type { ManagerPeriod } from '../../types/manager'

type ManagerPeriodControlsProps = {
  period: ManagerPeriod
  date: string
  rangeLabel?: string
  onPeriodChange: (period: ManagerPeriod) => void
  onDateChange: (date: string) => void
}

const periods: { value: ManagerPeriod; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

export function ManagerPeriodControls({
  period,
  date,
  rangeLabel,
  onPeriodChange,
  onDateChange,
}: ManagerPeriodControlsProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1.5 text-sm font-medium text-hms-navy">Period</p>
          <div className="flex gap-1 rounded-lg border border-hms-border bg-hms-cream/60 p-1">
            {periods.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onPeriodChange(item.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === item.value
                    ? 'bg-white text-hms-navy shadow-sm'
                    : 'text-hms-muted hover:text-hms-navy'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">Anchor date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
          />
        </label>
      </div>
      {rangeLabel ? (
        <p className="text-sm text-hms-muted">
          Showing <span className="font-medium text-hms-navy">{rangeLabel}</span>
        </p>
      ) : null}
    </div>
  )
}

export function formatRangeLabel(startDate: string, endDate: string) {
  if (startDate === endDate) return startDate
  return `${startDate} → ${endDate}`
}

export function moneyOrDash(value: number) {
  return formatMoney(value)
}
