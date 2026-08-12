import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createAdminMenuItem,
  createAdminRoom,
  deleteAdminMenuItem,
  deleteAdminRoom,
  fetchAdminAnalytics,
  fetchAdminMenu,
  fetchAdminOverview,
  fetchAdminRooms,
  fetchAdminSettings,
  fetchPasswordResetPendingCount,
  fetchPayrollAlerts,
  updateAdminMenuItem,
  updateAdminRoom,
  updateAdminSettings,
} from '../api/admin'
import {
  createManagerExpense,
  deleteManagerExpense,
  fetchManagerExpenses,
  fetchManagerFnb,
  fetchManagerIncome,
  fetchManagerOverview,
  fetchManagerRooms,
} from '../api/manager'
import { fetchStoreOverview } from '../api/store'
import { AdminAnalyticsTab } from '../components/admin/AdminAnalyticsTab'
import { AdminMenuTab } from '../components/admin/AdminMenuTab'
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab'
import { AdminPayrollTab } from '../components/admin/AdminPayrollTab'
import { AdminRoomsTab } from '../components/admin/AdminRoomsTab'
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab'
import { AdminUsersTab } from '../components/admin/AdminUsersTab'
import { ManagerExpensesTab } from '../components/manager/ManagerExpensesTab'
import { ManagerFnbTab } from '../components/manager/ManagerFnbTab'
import { ManagerIncomeTab } from '../components/manager/ManagerIncomeTab'
import {
  formatRangeLabel,
  ManagerPeriodControls,
} from '../components/manager/ManagerPeriodControls'
import { ManagerRevenuePanels } from '../components/manager/ManagerRevenuePanels'
import { ManagerRoomsBoard } from '../components/manager/ManagerRoomsBoard'
import { RolePageLayout } from '../components/layout/RolePageLayout'
import { StoreDashboardTab } from '../components/store/StoreDashboardTab'
import { useHotelBrand } from '../hotel/HotelBrandContext'
import { useNotifications } from '../notifications/NotificationContext'
import type {
  AdminAnalytics,
  AdminMenuItem,
  AdminOverview,
  AdminPeriod,
  AdminSettings,
  CreateAdminMenuItemInput,
  CreateAdminRoomInput,
  UpdateAdminMenuItemInput,
  UpdateAdminRoomInput,
  UpdateAdminSettingsInput,
} from '../types/admin'
import type {
  CreateExpenseInput,
  ManagerExpensesResult,
  ManagerFnbDetail,
  ManagerIncomeDetail,
  ManagerOverview,
  ManagerRoom,
} from '../types/manager'
import type { Room } from '../types/room'
import type { StoreOverview } from '../types/store'

type AdminTab =
  | 'analytics'
  | 'overview'
  | 'income'
  | 'expenses'
  | 'payroll'
  | 'fnb'
  | 'rooms'
  | 'menu'
  | 'store'
  | 'users'
  | 'settings'

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'overview', label: 'Overview' },
  { id: 'income', label: 'Income' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'fnb', label: 'F&B' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'menu', label: 'Menu' },
  { id: 'store', label: 'Store' },
  { id: 'users', label: 'Users' },
  { id: 'settings', label: 'Settings' },
]

const periodTabs: AdminTab[] = ['analytics', 'income', 'expenses', 'fnb']

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function AdminPage() {
  const { pushNotice } = useNotifications()
  const { refreshHotelName, setHotelName } = useHotelBrand()
  const [tab, setTab] = useState<AdminTab>('analytics')
  const [period, setPeriod] = useState<AdminPeriod>('day')
  const [date, setDate] = useState(() => toDateInputValue(new Date()))
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [managerOverview, setManagerOverview] =
    useState<ManagerOverview | null>(null)
  const [income, setIncome] = useState<ManagerIncomeDetail | null>(null)
  const [expensesResult, setExpensesResult] =
    useState<ManagerExpensesResult | null>(null)
  const [fnb, setFnb] = useState<ManagerFnbDetail | null>(null)
  const [storeOverview, setStoreOverview] = useState<StoreOverview | null>(null)
  const [managerRooms, setManagerRooms] = useState<ManagerRoom[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [menu, setMenu] = useState<AdminMenuItem[]>([])
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingResets, setPendingResets] = useState(0)
  const knownPendingRef = useRef<number | null>(null)
  const [payrollAttention, setPayrollAttention] = useState(0)
  const knownPayrollRef = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function pollResets() {
      try {
        const { pendingCount } = await fetchPasswordResetPendingCount()
        if (cancelled) return
        setPendingResets(pendingCount)
        if (
          knownPendingRef.current !== null &&
          pendingCount > knownPendingRef.current
        ) {
          pushNotice({
            tone: 'warn',
            title: 'Password reset requested',
            message:
              pendingCount === 1
                ? '1 staff member asked for a new password. Open Users to help them.'
                : `${pendingCount} staff members asked for a new password. Open Users to help them.`,
          })
        }
        knownPendingRef.current = pendingCount
      } catch {
        // Ignore polling errors; admin can still open Users.
      }
    }

    async function pollPayroll() {
      try {
        const { dueCount, overdueCount, alerts } = await fetchPayrollAlerts()
        if (cancelled) return
        const total = dueCount + overdueCount
        setPayrollAttention(total)
        if (
          total > 0 &&
          (knownPayrollRef.current === null ||
            total > knownPayrollRef.current)
        ) {
          const names = alerts
            .slice(0, 3)
            .map((a) => a.name)
            .join(', ')
          pushNotice({
            tone: overdueCount > 0 ? 'error' : 'warn',
            title:
              overdueCount > 0 ? 'Salaries overdue' : 'Salary pay day today',
            message:
              overdueCount > 0
                ? `${overdueCount} ${overdueCount === 1 ? 'salary is' : 'salaries are'} overdue (${names}). Open Payroll to pay.`
                : `${dueCount} ${dueCount === 1 ? 'employee reaches' : 'employees reach'} pay day today (${names}). Open Payroll to pay.`,
          })
        }
        knownPayrollRef.current = total
      } catch {
        // Ignore polling errors; admin can still open Payroll.
      }
    }

    void pollResets()
    void pollPayroll()
    const timer = window.setInterval(() => void pollResets(), 20000)
    const payrollTimer = window.setInterval(() => void pollPayroll(), 60000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.clearInterval(payrollTimer)
    }
  }, [pushNotice])

  const loadAnalytics = useCallback(async () => {
    setAnalytics(await fetchAdminAnalytics(period, date))
  }, [period, date])

  const loadOverview = useCallback(async () => {
    const [adminData, managerData] = await Promise.all([
      fetchAdminOverview(),
      fetchManagerOverview(),
    ])
    setOverview(adminData)
    setManagerOverview(managerData)
  }, [])

  const loadIncome = useCallback(async () => {
    setIncome(await fetchManagerIncome(period, date))
  }, [period, date])

  const loadExpenses = useCallback(async () => {
    setExpensesResult(await fetchManagerExpenses(period, date))
  }, [period, date])

  const loadFnb = useCallback(async () => {
    setFnb(await fetchManagerFnb(period, date))
  }, [period, date])

  const loadStore = useCallback(async () => {
    setStoreOverview(await fetchStoreOverview())
  }, [])

  const loadRooms = useCallback(async () => {
    const [catalog, board] = await Promise.all([
      fetchAdminRooms(),
      fetchManagerRooms(),
    ])
    setRooms(catalog)
    setManagerRooms(board)
  }, [])

  const loadMenu = useCallback(async () => {
    setMenu(await fetchAdminMenu())
  }, [])

  const loadSettings = useCallback(async () => {
    setSettings(await fetchAdminSettings())
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (tab === 'users' || tab === 'payroll') {
          return
        }

        if (tab === 'analytics') {
          await loadAnalytics()
          return
        }

        setTabLoading(true)
        if (tab === 'overview') await loadOverview()
        else if (tab === 'income') await loadIncome()
        else if (tab === 'expenses') await loadExpenses()
        else if (tab === 'fnb') await loadFnb()
        else if (tab === 'store') await loadStore()
        else if (tab === 'rooms') await loadRooms()
        else if (tab === 'menu') await loadMenu()
        else if (tab === 'settings') await loadSettings()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load admin data')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setTabLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [
    tab,
    loadAnalytics,
    loadOverview,
    loadIncome,
    loadExpenses,
    loadFnb,
    loadStore,
    loadRooms,
    loadMenu,
    loadSettings,
  ])

  async function refreshAfterChange() {
    if (tab === 'analytics') await loadAnalytics()
    if (tab === 'overview') await loadOverview()
    if (tab === 'rooms') await loadRooms()
    if (tab === 'menu') await loadMenu()
    if (tab === 'settings') await loadSettings()
  }

  async function handleCreateExpense(input: CreateExpenseInput) {
    setSaving(true)
    setError(null)
    try {
      await createManagerExpense(input)
      await loadExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense')
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteExpense(id: string) {
    setSaving(true)
    setError(null)
    try {
      await deleteManagerExpense(id)
      await loadExpenses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateRoom(input: CreateAdminRoomInput) {
    setSaving(true)
    setError(null)
    try {
      await createAdminRoom(input)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add room')
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateRoom(id: string, input: UpdateAdminRoomInput) {
    setSaving(true)
    setError(null)
    try {
      await updateAdminRoom(id, input)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update room')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRoom(id: string) {
    setSaving(true)
    setError(null)
    try {
      await deleteAdminRoom(id)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateMenuItem(input: CreateAdminMenuItemInput) {
    setSaving(true)
    setError(null)
    try {
      await createAdminMenuItem(input)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add menu item')
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateMenuItem(
    id: string,
    input: UpdateAdminMenuItemInput,
  ) {
    setSaving(true)
    setError(null)
    try {
      await updateAdminMenuItem(id, input)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update menu item')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteMenuItem(id: string) {
    setSaving(true)
    setError(null)
    try {
      await deleteAdminMenuItem(id)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete menu item')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveSettings(input: UpdateAdminSettingsInput) {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateAdminSettings(input)
      setSettings(updated)
      setHotelName(updated.hotelName)
      await refreshHotelName()
      pushNotice({
        tone: 'success',
        title: 'Settings saved',
        message: `Hotel name is now “${updated.hotelName}”.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      throw err
    } finally {
      setSaving(false)
    }
  }

  const rangeLabel = analytics
    ? formatRangeLabel(analytics.startDate, analytics.endDate)
    : undefined

  const navItems = tabs.map((item) => ({
    id: item.id,
    label: item.label,
    badge:
      item.id === 'users' && pendingResets > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">
          {pendingResets}
        </span>
      ) : item.id === 'payroll' && payrollAttention > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-semibold text-white">
          {payrollAttention}
        </span>
      ) : undefined,
  }))

  return (
    <RolePageLayout
      roleLabel="Administrator"
      title="System Administration"
      subtitle="Full property control — income and expenses, F&B sales, room occupancy, store inventory, staff accounts, and hotel configuration."
      navLabel="Admin views"
      navTitle="Admin menu"
      items={navItems}
      activeId={tab}
      onSelect={(id) => setTab(id as AdminTab)}
      banner={
        pendingResets > 0 ? (
          <div
            role="status"
            className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          >
            {pendingResets === 1
              ? '1 staff member requested a password reset.'
              : `${pendingResets} staff members requested a password reset.`}{' '}
            <button
              type="button"
              onClick={() => setTab('users')}
              className="font-medium underline underline-offset-2"
            >
              Open Users
            </button>
          </div>
        ) : null
      }
    >
      {periodTabs.includes(tab) ? (
        <ManagerPeriodControls
          period={period}
          date={date}
          rangeLabel={rangeLabel}
          onPeriodChange={setPeriod}
          onDateChange={setDate}
        />
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      {loading && tab === 'analytics' && !analytics ? (
        <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
          Loading analytics…
        </p>
      ) : null}

      {tab === 'analytics' && analytics ? (
        <AdminAnalyticsTab analytics={analytics} />
      ) : null}

      {tab === 'overview' ? (
        loading || tabLoading ? (
          <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
            Loading overview…
          </p>
        ) : overview ? (
          <>
            {managerOverview ? (
              <ManagerRevenuePanels overview={managerOverview} />
            ) : null}
            <AdminOverviewTab overview={overview} />
          </>
        ) : null
      ) : null}

      {tab === 'income' ? (
        <ManagerIncomeTab detail={income} loading={loading || tabLoading} />
      ) : null}

      {tab === 'expenses' ? (
        <ManagerExpensesTab
          result={expensesResult}
          loading={loading || tabLoading}
          saving={saving}
          onCreate={handleCreateExpense}
          onDelete={handleDeleteExpense}
        />
      ) : null}

      {tab === 'payroll' ? <AdminPayrollTab /> : null}

      {tab === 'fnb' ? (
        <ManagerFnbTab detail={fnb} loading={loading || tabLoading} />
      ) : null}

      {tab === 'store' ? (
        loading || tabLoading ? (
          <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
            Loading store inventory…
          </p>
        ) : storeOverview ? (
          <StoreDashboardTab overview={storeOverview} />
        ) : null
      ) : null}

      {tab === 'rooms' ? (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-hms-navy">
              Occupancy board
            </h2>
            <ManagerRoomsBoard
              rooms={managerRooms}
              loading={loading || tabLoading}
            />
          </section>
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold text-hms-navy">
              Room catalog
            </h2>
            <AdminRoomsTab
              rooms={rooms}
              loading={loading || tabLoading}
              saving={saving}
              onCreate={handleCreateRoom}
              onUpdate={handleUpdateRoom}
              onDelete={handleDeleteRoom}
            />
          </section>
        </div>
      ) : null}

      {tab === 'menu' ? (
        <AdminMenuTab
          items={menu}
          loading={loading || tabLoading}
          saving={saving}
          onCreate={handleCreateMenuItem}
          onUpdate={handleUpdateMenuItem}
          onDelete={handleDeleteMenuItem}
        />
      ) : null}

      {tab === 'users' ? (
        <AdminUsersTab onPendingCountChange={setPendingResets} />
      ) : null}

      {tab === 'settings' ? (
        <AdminSettingsTab
          settings={settings}
          loading={loading || tabLoading}
          saving={saving}
          onSave={handleSaveSettings}
        />
      ) : null}
    </RolePageLayout>
  )
}
