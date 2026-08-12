import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createOrder,
  fetchMenu,
  fetchOrders,
  updateOrderItems,
  updateOrderPayment,
  updateOrderStatus,
} from '../api/waiter'
import { RolePageLayout } from '../components/layout/RolePageLayout'
import { EditOrderForm } from '../components/waiter/EditOrderForm'
import { NewOrderForm } from '../components/waiter/NewOrderForm'
import { OrderRow } from '../components/waiter/OrderRow'
import { OrderStatCard } from '../components/waiter/OrderStatCard'
import {
  detectMenuAvailabilityChanges,
  detectOrderChanges,
  useInterval,
} from '../hooks/sync'
import { useNotifications } from '../notifications/NotificationContext'
import { formatMoney } from '../utils/money'
import type {
  CreateOrderInput,
  MenuItem,
  Order,
  OrderStatus,
  UpdateOrderItemsInput,
} from '../types/order'

type FilterValue = 'all' | OrderStatus
type WaiterTab = 'menu' | 'orders'

const POLL_MS = 5000

export function WaiterPage() {
  const { pushNotice } = useNotifications()
  const [tab, setTab] = useState<WaiterTab>('menu')
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<FilterValue>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const ordersRef = useRef<Order[]>([])
  const menuRef = useRef<MenuItem[]>([])
  const hasSyncedRef = useRef(false)

  const syncFromServer = useCallback(async () => {
    const [menuData, orderData] = await Promise.all([fetchMenu(), fetchOrders()])

    if (hasSyncedRef.current) {
      detectOrderChanges(ordersRef.current, orderData, ({ order, previousStatus, isNew }) => {
        if (isNew) return
        if (previousStatus === 'preparing' && order.status === 'ready') {
          pushNotice({
            tone: 'success',
            title: 'Order ready',
            message: `${order.orderNumber} (${order.type === 'table' ? 'Table' : 'Room'} ${order.location}) is ready to serve.`,
          })
          setTab('orders')
          setFilter('ready')
        }
      })

      detectMenuAvailabilityChanges(menuRef.current, menuData, ({ item }) => {
        pushNotice({
          tone: item.available ? 'info' : 'warn',
          title: item.available ? 'Item available again' : 'Item unavailable',
          message: `${item.name} is now ${item.available ? 'available' : 'unavailable'} on the menu.`,
        })
      })
    }

    ordersRef.current = orderData
    menuRef.current = menuData
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
          setError(err instanceof Error ? err.message : 'Failed to load waiter data')
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
        acc[order.status] += 1
        return acc
      },
      { pending: 0, preparing: 0, ready: 0, served: 0 },
    )
  }, [orders])

  const money = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        if (order.paymentStatus === 'paid') {
          acc.collected += order.total
          acc.paidCount += 1
        } else {
          acc.unpaid += order.total
          acc.unpaidCount += 1
        }
        return acc
      },
      { collected: 0, unpaid: 0, paidCount: 0, unpaidCount: 0 },
    )
  }, [orders])

  const filteredOrders = useMemo(() => {
    const list =
      filter === 'all' ? orders : orders.filter((order) => order.status === filter)
    return [...list].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }, [orders, filter])

  const editingOrder = editingId
    ? (orders.find((order) => order.id === editingId) ?? null)
    : null

  const openOrdersCount = counts.pending + counts.preparing + counts.ready

  async function handleCreateOrder(input: CreateOrderInput) {
    setCreating(true)
    setError(null)
    try {
      const created = await createOrder(input)
      setOrders((prev) => {
        const next = [created, ...prev]
        ordersRef.current = next
        return next
      })
      setFilter('all')
      setTab('orders')
      pushNotice({
        tone: 'info',
        title: 'Order placed',
        message: `${created.orderNumber} is pending. Send it to kitchen when ready.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
      throw err
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdateItems(orderId: string, input: UpdateOrderItemsInput) {
    setSavingEdit(true)
    setError(null)
    try {
      const updated = await updateOrderItems(orderId, input)
      setOrders((prev) => {
        const next = prev.map((order) => (order.id === orderId ? updated : order))
        ordersRef.current = next
        return next
      })
      setEditingId(null)
      setTab('orders')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order items')
      throw err
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId)
    setError(null)
    try {
      const updated = await updateOrderStatus(orderId, status)
      setOrders((prev) => {
        const next = prev.map((order) => (order.id === orderId ? updated : order))
        ordersRef.current = next
        return next
      })

      if (status === 'preparing') {
        pushNotice({
          tone: 'info',
          title: 'Sent to kitchen',
          message: `${updated.orderNumber} is now in the kitchen queue.`,
        })
      }
      if (status === 'served') {
        pushNotice({
          tone: 'success',
          title: 'Order served',
          message: `${updated.orderNumber} marked as served.`,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handlePaymentChange(orderId: string, paid: boolean) {
    setUpdatingId(orderId)
    setError(null)
    try {
      const updated = await updateOrderPayment(orderId, paid)
      setOrders((prev) => {
        const next = prev.map((order) => (order.id === orderId ? updated : order))
        ordersRef.current = next
        return next
      })

      if (paid) {
        pushNotice({
          tone: 'success',
          title: 'Payment recorded',
          message: `${updated.orderNumber} marked as paid — it now counts toward income.`,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment')
    } finally {
      setUpdatingId(null)
    }
  }

  function handleEdit(orderId: string) {
    setEditingId(orderId)
    setTab('menu')
  }

  function handleTabChange(next: WaiterTab) {
    if (next === 'orders') setEditingId(null)
    setTab(next)
  }

  return (
    <RolePageLayout
      roleLabel="Waiter"
      title="Service Order Board"
      subtitle="Orders sync with the kitchen. You’ll be notified when food is ready, and menu availability updates live."
      navLabel="Waiter views"
      navTitle="Waiter menu"
      items={[
        { id: 'menu', label: 'Menu' },
        {
          id: 'orders',
          label: 'Orders',
          badge:
            !loading && counts.ready > 0 ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {counts.ready}
              </span>
            ) : !loading && openOrdersCount > 0 ? (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                {openOrdersCount}
              </span>
            ) : undefined,
        },
      ]}
      activeId={tab}
      onSelect={(id) => handleTabChange(id as WaiterTab)}
      banner={
        error ? (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </div>
        ) : null
      }
    >
      {tab === 'menu' ? (
        <div role="tabpanel" aria-label="Menu">
          {editingOrder ? (
            <EditOrderForm
              order={editingOrder}
              menu={menu}
              isSubmitting={savingEdit}
              onCancel={() => {
                setEditingId(null)
                setTab('orders')
              }}
              onSubmit={(input) => handleUpdateItems(editingOrder.id, input)}
            />
          ) : loading ? (
            <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
              Loading menu…
            </p>
          ) : (
            <NewOrderForm menu={menu} isSubmitting={creating} onSubmit={handleCreateOrder} />
          )}
        </div>
      ) : (
        <div role="tabpanel" aria-label="Orders">
          <section
            aria-label="Income summary"
            className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-emerald-800/80">
                Total income (paid)
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-900">
                {formatMoney(money.collected)}
              </p>
              <p className="mt-1 text-xs text-emerald-800/80">
                {money.paidCount} paid {money.paidCount === 1 ? 'order' : 'orders'}
              </p>
            </div>
            <div
              className={`rounded-xl border p-4 shadow-sm ${
                money.unpaid > 0
                  ? 'border-amber-300 bg-amber-50/60'
                  : 'border-hms-border bg-white'
              }`}
            >
              <p
                className={`text-xs uppercase tracking-wide ${
                  money.unpaid > 0 ? 'text-amber-900/80' : 'text-hms-muted'
                }`}
              >
                Awaiting payment
              </p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  money.unpaid > 0 ? 'text-amber-950' : 'text-hms-navy'
                }`}
              >
                {formatMoney(money.unpaid)}
              </p>
              <p className="mt-1 text-xs text-hms-muted">
                {money.unpaidCount} unpaid {money.unpaidCount === 1 ? 'order' : 'orders'}
              </p>
            </div>
          </section>

          <section
            aria-label="Order status summary"
            className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          >
            <OrderStatCard
              label="All Orders"
              count={orders.length}
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            />
            <OrderStatCard
              label="Pending"
              count={counts.pending}
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
              accent="pending"
            />
            <OrderStatCard
              label="Preparing"
              count={counts.preparing}
              active={filter === 'preparing'}
              onClick={() => setFilter('preparing')}
              accent="preparing"
            />
            <OrderStatCard
              label="Ready"
              count={counts.ready}
              active={filter === 'ready'}
              onClick={() => setFilter('ready')}
              accent="ready"
            />
            <OrderStatCard
              label="Served"
              count={counts.served}
              active={filter === 'served'}
              onClick={() => setFilter('served')}
              accent="served"
            />
          </section>

          <section
            aria-label="Order list"
            className="overflow-hidden rounded-xl border border-hms-border bg-white shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-left">
                <thead className="border-b border-hms-border bg-hms-cream/60">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                      Order
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                      Location
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                      Items
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                      Total
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted lg:table-cell">
                      Note
                    </th>
                    <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted sm:table-cell">
                      Updated
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-hms-muted">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-hms-muted">
                        Loading orders…
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        isUpdating={updatingId === order.id}
                        onStatusChange={handleStatusChange}
                        onPaymentChange={handlePaymentChange}
                        onEdit={handleEdit}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-hms-muted">
                        {orders.length === 0
                          ? 'No orders yet. Switch to Menu to place one.'
                          : 'No orders match this filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </RolePageLayout>
  )
}
