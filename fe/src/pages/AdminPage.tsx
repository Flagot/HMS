import { useCallback, useEffect, useState } from 'react'
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
  updateAdminMenuItem,
  updateAdminRoom,
  updateAdminSettings,
} from '../api/admin'
import { AdminAnalyticsTab } from '../components/admin/AdminAnalyticsTab'
import { AdminMenuTab } from '../components/admin/AdminMenuTab'
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab'
import { AdminRoomsTab } from '../components/admin/AdminRoomsTab'
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab'
import { AdminUsersTab } from '../components/admin/AdminUsersTab'
import {
  formatRangeLabel,
  ManagerPeriodControls,
} from '../components/manager/ManagerPeriodControls'
import { PageHeader } from '../components/ui/PageHeader'
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
import type { Room } from '../types/room'

type AdminTab =
  | 'analytics'
  | 'overview'
  | 'rooms'
  | 'menu'
  | 'users'
  | 'settings'

const tabs: { id: AdminTab; label: string }[] = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'menu', label: 'Menu' },
  { id: 'users', label: 'Users' },
  { id: 'settings', label: 'Settings' },
]

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('analytics')
  const [period, setPeriod] = useState<AdminPeriod>('week')
  const [date, setDate] = useState(() => toDateInputValue(new Date()))
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [menu, setMenu] = useState<AdminMenuItem[]>([])
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    setAnalytics(await fetchAdminAnalytics(period, date))
  }, [period, date])

  const loadOverview = useCallback(async () => {
    setOverview(await fetchAdminOverview())
  }, [])

  const loadRooms = useCallback(async () => {
    setRooms(await fetchAdminRooms())
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
        if (tab === 'users') {
          return
        }

        if (tab === 'analytics') {
          await loadAnalytics()
          return
        }

        setTabLoading(true)
        if (tab === 'overview') await loadOverview()
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
  }, [tab, loadAnalytics, loadOverview, loadRooms, loadMenu, loadSettings])

  async function refreshAfterChange() {
    if (tab === 'analytics') await loadAnalytics()
    if (tab === 'overview') await loadOverview()
    if (tab === 'rooms') await loadRooms()
    if (tab === 'menu') await loadMenu()
    if (tab === 'settings') await loadSettings()
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        roleLabel="Administrator"
        title="System Administration"
        subtitle="Analytics across the property, plus room and menu configuration and hotel settings."
      />

      {tab === 'analytics' ? (
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

      <div
        role="tablist"
        aria-label="Admin views"
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
          <AdminOverviewTab overview={overview} />
        ) : null
      ) : null}

      {tab === 'rooms' ? (
        <AdminRoomsTab
          rooms={rooms}
          loading={loading || tabLoading}
          saving={saving}
          onCreate={handleCreateRoom}
          onUpdate={handleUpdateRoom}
          onDelete={handleDeleteRoom}
        />
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

      {tab === 'users' ? <AdminUsersTab /> : null}

      {tab === 'settings' ? (
        <AdminSettingsTab
          settings={settings}
          loading={loading || tabLoading}
          saving={saving}
          onSave={handleSaveSettings}
        />
      ) : null}
    </div>
  )
}
