import { useCallback, useEffect, useState } from 'react'
import {
  createManagerExpense,
  deleteManagerExpense,
  fetchManagerAnalytics,
  fetchManagerExpenses,
  fetchManagerFnb,
  fetchManagerIncome,
  fetchManagerRooms,
} from '../api/manager'
import { ManagerDashboardTab } from '../components/manager/ManagerDashboardTab'
import { ManagerExpensesTab } from '../components/manager/ManagerExpensesTab'
import { ManagerFnbTab } from '../components/manager/ManagerFnbTab'
import { ManagerIncomeTab } from '../components/manager/ManagerIncomeTab'
import {
  formatRangeLabel,
  ManagerPeriodControls,
} from '../components/manager/ManagerPeriodControls'
import { ManagerRoomsBoard } from '../components/manager/ManagerRoomsBoard'
import { PageHeader } from '../components/ui/PageHeader'
import type {
  CreateExpenseInput,
  ManagerAnalytics,
  ManagerExpensesResult,
  ManagerFnbDetail,
  ManagerIncomeDetail,
  ManagerPeriod,
  ManagerRoom,
} from '../types/manager'

type ManagerTab = 'dashboard' | 'income' | 'expenses' | 'rooms' | 'fnb'

const tabs: { id: ManagerTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'fnb', label: 'F&B' },
]

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function ManagerPage() {
  const [tab, setTab] = useState<ManagerTab>('dashboard')
  const [period, setPeriod] = useState<ManagerPeriod>('day')
  const [date, setDate] = useState(() => toDateInputValue(new Date()))
  const [analytics, setAnalytics] = useState<ManagerAnalytics | null>(null)
  const [income, setIncome] = useState<ManagerIncomeDetail | null>(null)
  const [expenses, setExpenses] = useState<ManagerExpensesResult | null>(null)
  const [fnb, setFnb] = useState<ManagerFnbDetail | null>(null)
  const [rooms, setRooms] = useState<ManagerRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [savingExpense, setSavingExpense] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCore = useCallback(async (selectedPeriod: ManagerPeriod, selectedDate: string) => {
    const [analyticsData, roomData] = await Promise.all([
      fetchManagerAnalytics(selectedPeriod, selectedDate),
      fetchManagerRooms(),
    ])
    setAnalytics(analyticsData)
    setRooms(roomData)
  }, [])

  const loadTabData = useCallback(
    async (selectedTab: ManagerTab, selectedPeriod: ManagerPeriod, selectedDate: string) => {
      if (selectedTab === 'dashboard' || selectedTab === 'rooms') return

      setTabLoading(true)
      try {
        if (selectedTab === 'income') {
          setIncome(await fetchManagerIncome(selectedPeriod, selectedDate))
        } else if (selectedTab === 'expenses') {
          setExpenses(await fetchManagerExpenses(selectedPeriod, selectedDate))
        } else if (selectedTab === 'fnb') {
          setFnb(await fetchManagerFnb(selectedPeriod, selectedDate))
        }
      } finally {
        setTabLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        await loadCore(period, date)
        if (!cancelled) {
          await loadTabData(tab, period, date)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load manager data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [period, date, tab, loadCore, loadTabData])

  async function refreshAfterExpenseChange() {
    const [analyticsData, expenseData] = await Promise.all([
      fetchManagerAnalytics(period, date),
      fetchManagerExpenses(period, date),
    ])
    setAnalytics(analyticsData)
    setExpenses(expenseData)
  }

  async function handleCreateExpense(input: CreateExpenseInput) {
    setSavingExpense(true)
    setError(null)
    try {
      await createManagerExpense(input)
      await refreshAfterExpenseChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense')
      throw err
    } finally {
      setSavingExpense(false)
    }
  }

  async function handleDeleteExpense(id: string) {
    setSavingExpense(true)
    setError(null)
    try {
      await deleteManagerExpense(id)
      await refreshAfterExpenseChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense')
    } finally {
      setSavingExpense(false)
    }
  }

  const rangeLabel = analytics
    ? formatRangeLabel(analytics.startDate, analytics.endDate)
    : undefined

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        roleLabel="Manager"
        title="Operations Dashboard"
        subtitle="Track income and expenses by day, week, or month — rooms, F&B, and operating costs in one place."
      />

      <ManagerPeriodControls
        period={period}
        date={date}
        rangeLabel={rangeLabel}
        onPeriodChange={setPeriod}
        onDateChange={setDate}
      />

      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <div
        role="tablist"
        aria-label="Manager views"
        className="mb-8 flex flex-wrap gap-1 rounded-xl border border-hms-border bg-hms-cream/60 p-1"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
              tab === item.id
                ? 'bg-white text-hms-navy shadow-sm'
                : 'text-hms-muted hover:text-hms-navy'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && !analytics ? (
        <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
          Loading dashboard…
        </p>
      ) : null}

      {tab === 'dashboard' && analytics ? (
        <ManagerDashboardTab analytics={analytics} />
      ) : null}

      {tab === 'income' ? (
        <ManagerIncomeTab detail={income} loading={loading || tabLoading} />
      ) : null}

      {tab === 'expenses' ? (
        <ManagerExpensesTab
          result={expenses}
          loading={loading || tabLoading}
          saving={savingExpense}
          onCreate={handleCreateExpense}
          onDelete={handleDeleteExpense}
        />
      ) : null}

      {tab === 'rooms' ? (
        <ManagerRoomsBoard rooms={rooms} loading={loading} />
      ) : null}

      {tab === 'fnb' ? (
        <ManagerFnbTab detail={fnb} loading={loading || tabLoading} />
      ) : null}
    </div>
  )
}
