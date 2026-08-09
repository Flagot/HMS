import type { AnalyticsSeriesPoint, IncomeSourceSlice } from '../../types/manager'
import { formatMoney } from '../../utils/money'

type IncomeExpenseChartProps = {
  series: AnalyticsSeriesPoint[]
}

export function IncomeExpenseChart({ series }: IncomeExpenseChartProps) {
  const width = 640
  const height = 220
  const pad = { top: 16, right: 12, bottom: 36, left: 48 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  const maxValue = Math.max(
    1,
    ...series.flatMap((point) => [point.totalIncome, point.expenses]),
  )

  const barGroupWidth = innerW / Math.max(series.length, 1)
  const barWidth = Math.min(18, barGroupWidth * 0.35)

  function y(value: number) {
    return pad.top + innerH - (value / maxValue) * innerH
  }

  function label(date: string) {
    if (series.length > 14) return date.slice(8)
    return date.slice(5)
  }

  return (
    <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Income vs expenses
        </h3>
        <div className="flex gap-3 text-xs text-hms-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-hms-navy" /> Income
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-600" /> Expenses
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full min-w-[28rem]">
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const value = maxValue * tick
            const yy = y(value)
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={yy}
                  y2={yy}
                  stroke="#e8e4dc"
                  strokeWidth={1}
                />
                <text
                  x={pad.left - 8}
                  y={yy + 4}
                  textAnchor="end"
                  className="fill-hms-muted"
                  fontSize={10}
                >
                  {Math.round(value)}
                </text>
              </g>
            )
          })}

          {series.map((point, index) => {
            const cx = pad.left + barGroupWidth * index + barGroupWidth / 2
            const incomeH = (point.totalIncome / maxValue) * innerH
            const expenseH = (point.expenses / maxValue) * innerH
            return (
              <g key={point.date}>
                <rect
                  x={cx - barWidth - 2}
                  y={pad.top + innerH - incomeH}
                  width={barWidth}
                  height={Math.max(incomeH, 0)}
                  fill="#1e3a5f"
                  rx={2}
                >
                  <title>
                    {point.date}: income {formatMoney(point.totalIncome)}
                  </title>
                </rect>
                <rect
                  x={cx + 2}
                  y={pad.top + innerH - expenseH}
                  width={barWidth}
                  height={Math.max(expenseH, 0)}
                  fill="#d97706"
                  rx={2}
                >
                  <title>
                    {point.date}: expenses {formatMoney(point.expenses)}
                  </title>
                </rect>
                <text
                  x={cx}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-hms-muted"
                  fontSize={10}
                >
                  {label(point.date)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

type IncomeSourceChartProps = {
  slices: IncomeSourceSlice[]
}

const sliceColors = {
  rooms: '#1e3a5f',
  fnb: '#0f766e',
}

export function IncomeSourceChart({ slices }: IncomeSourceChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const size = 180
  const radius = 70
  const cx = size / 2
  const cy = size / 2

  let angle = -Math.PI / 2
  const arcs = slices.map((slice) => {
    const portion = total > 0 ? slice.value / total : 0
    const sweep = portion * Math.PI * 2
    const start = angle
    const end = angle + sweep
    angle = end

    const x1 = cx + radius * Math.cos(start)
    const y1 = cy + radius * Math.sin(start)
    const x2 = cx + radius * Math.cos(end)
    const y2 = cy + radius * Math.sin(end)
    const large = sweep > Math.PI ? 1 : 0

    const path =
      portion <= 0
        ? ''
        : portion >= 0.999
          ? `M ${cx} ${cy} m 0 -${radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 -${radius * 2}`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`

    return { ...slice, path, portion }
  })

  return (
    <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-hms-navy">
        Income by source
      </h3>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-40 w-40">
          {total <= 0 ? (
            <circle cx={cx} cy={cy} r={radius} fill="#e8e4dc" />
          ) : (
            arcs.map((arc) =>
              arc.path ? (
                <path key={arc.key} d={arc.path} fill={sliceColors[arc.key]}>
                  <title>
                    {arc.label}: {formatMoney(arc.value)}
                  </title>
                </path>
              ) : null,
            )
          )}
        </svg>
        <ul className="space-y-2 text-sm">
          {slices.map((slice) => (
            <li key={slice.key} className="flex items-center gap-2 text-hms-navy">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: sliceColors[slice.key] }}
              />
              <span>{slice.label}</span>
              <span className="text-hms-muted">{formatMoney(slice.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
