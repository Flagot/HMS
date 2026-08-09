import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AdminAnalytics, AdminNamedCount } from '../../types/admin'
import { formatMoney, formatPercent } from '../../utils/money'

type AdminAnalyticsTabProps = {
  analytics: AdminAnalytics
}

const SOURCE_COLORS: Record<string, string> = {
  rooms: '#1e3a5f',
  fnb: '#0f766e',
}

const STATUS_COLORS = ['#1e3a5f', '#0f766e', '#d97706', '#be123c', '#64748b']

function shortDate(date: string, dense: boolean) {
  return dense ? date.slice(8) : date.slice(5)
}

function DonutChart({
  title,
  data,
  colors,
}: {
  title: string
  data: AdminNamedCount[]
  colors?: Record<string, string> | string[]
}) {
  const total = data.reduce((sum, row) => sum + row.value, 0)

  return (
    <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-hms-navy">{title}</h3>
      <div className="mt-2 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
            >
              {data.map((entry, index) => {
                const fill = Array.isArray(colors)
                  ? colors[index % colors.length]
                  : (colors?.[entry.key] ?? STATUS_COLORS[index % STATUS_COLORS.length])
                return <Cell key={entry.key} fill={fill} />
              })}
            </Pie>
            <Tooltip
              formatter={(value) =>
                typeof value === 'number' ? String(value) : String(value ?? '')
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-1 space-y-1.5 text-sm">
        {data.map((row, index) => {
          const fill = Array.isArray(colors)
            ? colors[index % colors.length]
            : (colors?.[row.key] ?? STATUS_COLORS[index % STATUS_COLORS.length])
          const share = total > 0 ? row.value / total : 0
          return (
            <li key={row.key} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-hms-navy">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: fill }}
                />
                {row.label}
              </span>
              <span className="text-hms-muted">
                {row.value}
                {total > 0 ? ` · ${Math.round(share * 100)}%` : ''}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function AdminAnalyticsTab({ analytics }: AdminAnalyticsTabProps) {
  const dense = analytics.series.length > 14
  const chartData = analytics.series.map((point) => ({
    ...point,
    label: shortDate(point.date, dense),
  }))

  const roomsTotal = analytics.roomsByType.reduce(
    (sum, row) => sum + row.value,
    0,
  )
  const lastPoint = analytics.series[analytics.series.length - 1]
  const occupiedNow = lastPoint?.occupiedRooms ?? 0

  const cards = [
    {
      label: 'Total income',
      value: formatMoney(analytics.kpis.totalIncome),
      hint: `${formatMoney(analytics.kpis.roomIncome)} rooms · ${formatMoney(analytics.kpis.fnbIncome)} F&B`,
    },
    {
      label: 'Total expenses',
      value: formatMoney(analytics.kpis.totalExpenses),
      hint: 'Operating costs in period',
    },
    {
      label: 'Net',
      value: formatMoney(analytics.kpis.net),
      hint:
        analytics.kpis.net >= 0
          ? 'Income after expenses'
          : 'Expenses exceed income',
    },
    {
      label: 'Rooms occupied',
      value: `${occupiedNow} / ${roomsTotal}`,
      hint: `${formatPercent(analytics.kpis.avgOccupancyRate)} avg · ${analytics.kpis.checkInCount} check-ins`,
    },
    {
      label: 'F&B orders',
      value: String(analytics.kpis.orderCount),
      hint: 'Orders created in period',
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-hms-border bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-hms-muted">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-hms-navy">{card.value}</p>
            <p className="mt-1 text-xs text-hms-muted">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Income vs expenses
          </h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e8e4dc" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} width={48} />
                <Tooltip
                  formatter={(value) =>
                    formatMoney(typeof value === 'number' ? value : Number(value) || 0)
                  }
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.date ?? '')
                  }
                />
                <Legend />
                <Bar dataKey="totalIncome" name="Income" fill="#1e3a5f" radius={[2, 2, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#d97706" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2">
          <DonutChart
            title="Revenue by source"
            data={analytics.revenueBySource}
            colors={SOURCE_COLORS}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Rooms occupied
          </h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#e8e4dc" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  width={32}
                  domain={[0, Math.max(roomsTotal, 1)]}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value) =>
                    `${typeof value === 'number' ? value : value} of ${roomsTotal} rooms`
                  }
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.date ?? '')
                  }
                />
                <Line
                  type="monotone"
                  dataKey="occupiedRooms"
                  name="Rooms occupied"
                  stroke="#0f766e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Orders & arrivals
          </h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e8e4dc" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} width={32} allowDecimals={false} />
                <Tooltip
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.date ?? '')
                  }
                />
                <Legend />
                <Bar dataKey="orders" name="Orders" fill="#1e3a5f" radius={[2, 2, 0, 0]} />
                <Bar dataKey="checkIns" name="Check-ins" fill="#0f766e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="checkOuts" name="Check-outs" fill="#d97706" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <DonutChart
          title="Rooms by type"
          data={analytics.roomsByType}
          colors={['#1e3a5f', '#0f766e', '#d97706']}
        />
        <DonutChart
          title="Housekeeping status"
          data={analytics.roomsByStatus}
          colors={['#be123c', '#d97706', '#0f766e', '#64748b']}
        />
        <DonutChart
          title="Orders by status"
          data={
            analytics.ordersByStatus.length > 0
              ? analytics.ordersByStatus
              : [{ key: 'none', label: 'No orders', value: 1 }]
          }
          colors={STATUS_COLORS}
        />
      </section>

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Top F&B items
        </h3>
        {analytics.topFoodItems.length === 0 ? (
          <p className="mt-4 text-sm text-hms-muted">No F&B sales in this period.</p>
        ) : (
          <ul className="mt-4 divide-y divide-hms-border">
            {analytics.topFoodItems.map((item) => (
              <li
                key={item.name}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <span className="text-hms-navy">
                  {item.name}
                  <span className="ml-2 text-xs text-hms-muted">×{item.quantity}</span>
                </span>
                <span className="font-medium text-hms-navy">
                  {formatMoney(item.revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
