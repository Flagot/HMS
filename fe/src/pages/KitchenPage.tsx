import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchKitchenMenu,
  fetchKitchenOrders,
  updateKitchenOrderStatus,
  updateMenuAvailability,
} from '../api/kitchen'
import { PageHeader } from '../components/ui/PageHeader'
import { KitchenAvailabilityPanel } from '../components/kitchen/KitchenAvailabilityPanel'
import { KitchenOrderCard } from '../components/kitchen/KitchenOrderCard'
import { QueueStatCard } from '../components/kitchen/QueueStatCard'
import { detectOrderChanges, useInterval } from '../hooks/sync'
import { useNotifications } from '../notifications/NotificationContext'
import type { MenuItem, Order, OrderStatus } from '../types/order'

type KitchenTab = 'queue' | 'availability'
type QueueFilter = 'all' | 'pending' | 'preparing' | 'ready'

const POLL_MS = 5000

export function KitchenPage() {
  const { pushNotice } = useNotifications()
  const [tab, setTab] = useState<KitchenTab>('queue')
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [updatingMenuId, setUpdatingMenuId] = useState<string | null>(null)

  const ordersRef = useRef<Order[]>([])
  const hasSyncedRef = useRef(false)

  const syncFromServer = useCallback(async () => {
    const [menuData, orderData] = await Promise.all([
      fetchKitchenMenu(),
      fetchKitchenOrders(),
    ])

    if (hasSyncedRef.current) {
      detectOrderChanges(ordersRef.current, orderData, ({ order, previousStatus, isNew }) => {
        const locationLabel = `${order.type === 'table' ? 'Table' : 'Room'} ${order.location}`

        if (isNew && (order.status === 'pending' || order.status === 'preparing')) {
          pushNotice({
            tone: 'warn',
            title: 'New kitchen ticket',
            message: `${order.orderNumber} · ${locationLabel} just arrived.`,
          })
          setTab('queue')
          return
        }

        if (previousStatus === 'pending' && order.status === 'preparing') {
          pushNotice({
            tone: 'info',
            title: 'Sent by waiter',
            message: `${order.orderNumber} · ${locationLabel} was sent to kitchen.`,
          })
          setTab('queue')
          setFilter('preparing')
        }
      })
    }

    ordersRef.current = orderData
    hasSyncedRef.current = true
    setMenu(menuData)
    setOrders(orderData)
  }, [pushNotice])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        await syncFromServer()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load kitchen data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [syncFromServer])

  useInterval(
    async () => {
      try {
        await syncFromServer()
      } catch {
        // Keep UI usable; next poll will retry.
      }
    },
    POLL_MS,
    { enabled: !loading },
  )

  const counts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        if (order.status === 'pending' || order.status === 'preparing' || order.status === 'ready') {
          acc[order.status] += 1
        }
        return acc
      },
      { pending: 0, preparing: 0, ready: 0 },
    )
  }, [orders])

  const filteredOrders = useMemo(() => {
    const list =
      filter === 'all' ? orders : orders.filter((order) => order.status === filter)
    return [...list].sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    )
  }, [orders, filter])

  const activeQueueCount = counts.pending + counts.preparing

  async function handleOrderStatusChange(
    orderId: string,
    status: Extract<OrderStatus, 'preparing' | 'ready'>,
  ) {
    setUpdatingOrderId(orderId)
    setError(null)
    try {
      const updated = await updateKitchenOrderStatus(orderId, status)
      setOrders((prev) => {
        const next = prev.map((order) => (order.id === orderId ? updated : order))
        ordersRef.current = next
        return next
      })

      if (status === 'ready') {
        pushNotice({
          tone: 'success',
          title: 'Marked ready',
          message: `${updated.orderNumber} is ready — waiter will be notified.`,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  async function handleToggleAvailability(item: MenuItem) {
    setUpdatingMenuId(item.id)
    setError(null)
    try {
      const updated = await updateMenuAvailability(item.id, !item.available)
      setMenu((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)))
      pushNotice({
        tone: updated.available ? 'info' : 'warn',
        title: updated.available ? 'Item available' : 'Item unavailable',
        message: `${updated.name} will ${updated.available ? 'appear as available' : 'show as unavailable'} on the waiter menu.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability')
    } finally {
      setUpdatingMenuId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        roleLabel="Kitchen"
        title="Kitchen Board"
        subtitle="Queue syncs with waiter orders. Toggle item availability so the waiter menu stays accurate."
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
        aria-label="Kitchen views"
        className="mb-8 flex gap-1 rounded-xl border border-hms-border bg-hms-cream/60 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'queue'}
          onClick={() => setTab('queue')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'queue'
              ? 'bg-white text-hms-navy shadow-sm'
              : 'text-hms-muted hover:text-hms-navy'
          }`}
        >
          Queue
          {!loading && activeQueueCount > 0 ? (
            <span className="ml-2 rounded-full bg-hms-navy/10 px-2 py-0.5 text-xs font-semibold text-hms-navy">
              {activeQueueCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'availability'}
          onClick={() => setTab('availability')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'availability'
              ? 'bg-white text-hms-navy shadow-sm'
              : 'text-hms-muted hover:text-hms-navy'
          }`}
        >
          Availability
        </button>
      </div>

      {tab === 'queue' ? (
        <div role="tabpanel" aria-label="Kitchen queue">
          <section
            aria-label="Queue filters"
            className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            <QueueStatCard
              label="All Active"
              count={orders.length}
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <QueueStatCard
              label="Pending"
              count={counts.pending}
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
              accent="pending"
            />
            <QueueStatCard
              label="Preparing"
              count={counts.preparing}
              active={filter === 'preparing'}
              onClick={() => setFilter('preparing')}
              accent="preparing"
            />
            <QueueStatCard
              label="Ready"
              count={counts.ready}
              active={filter === 'ready'}
              onClick={() => setFilter('ready')}
              accent="ready"
            />
          </section>

          {loading ? (
            <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
              Loading queue…
            </p>
          ) : filteredOrders.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredOrders.map((order) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  isUpdating={updatingOrderId === order.id}
                  onStatusChange={handleOrderStatusChange}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
              {orders.length === 0
                ? 'No active kitchen tickets. Waiting for waiter orders.'
                : 'No tickets match this filter.'}
            </p>
          )}
        </div>
      ) : (
        <div role="tabpanel" aria-label="Menu availability">
          <KitchenAvailabilityPanel
            menu={menu}
            loading={loading}
            updatingId={updatingMenuId}
            onToggle={(item) => void handleToggleAvailability(item)}
          />
        </div>
      )}
    </div>
  )
}
