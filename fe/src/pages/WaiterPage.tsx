import { useEffect, useMemo, useState } from 'react'
import {
  createOrder,
  fetchMenu,
  fetchOrders,
  updateOrderItems,
  updateOrderStatus,
} from '../api/waiter'
import { PageHeader } from '../components/ui/PageHeader'
import { EditOrderForm } from '../components/waiter/EditOrderForm'
import { NewOrderForm } from '../components/waiter/NewOrderForm'
import { OrderRow } from '../components/waiter/OrderRow'
import { OrderStatCard } from '../components/waiter/OrderStatCard'
import type {
  CreateOrderInput,
  MenuItem,
  Order,
  OrderStatus,
  UpdateOrderItemsInput,
} from '../types/order'

type FilterValue = 'all' | OrderStatus
type WaiterTab = 'menu' | 'orders'

export function WaiterPage() {
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

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [menuData, orderData] = await Promise.all([fetchMenu(), fetchOrders()])
        if (!cancelled) {
          setMenu(menuData)
          setOrders(orderData)
        }
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
  }, [])

  const counts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc[order.status] += 1
        return acc
      },
      { pending: 0, preparing: 0, ready: 0, served: 0 },
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

  const openOrdersCount =
    counts.pending + counts.preparing + counts.ready

  async function handleCreateOrder(input: CreateOrderInput) {
    setCreating(true)
    setError(null)
    try {
      const created = await createOrder(input)
      setOrders((prev) => [created, ...prev])
      setFilter('all')
      setTab('orders')
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
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)))
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
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        roleLabel="Waiter"
        title="Service Order Board"
        subtitle="Build orders from the menu, then track status on the orders board."
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
        aria-label="Waiter views"
        className="mb-8 flex gap-1 rounded-xl border border-hms-border bg-hms-cream/60 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'menu'}
          onClick={() => handleTabChange('menu')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'menu'
              ? 'bg-white text-hms-navy shadow-sm'
              : 'text-hms-muted hover:text-hms-navy'
          }`}
        >
          Menu
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'orders'}
          onClick={() => handleTabChange('orders')}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'orders'
              ? 'bg-white text-hms-navy shadow-sm'
              : 'text-hms-muted hover:text-hms-navy'
          }`}
        >
          Orders
          {!loading && openOrdersCount > 0 ? (
            <span className="ml-2 rounded-full bg-hms-navy/10 px-2 py-0.5 text-xs font-semibold text-hms-navy">
              {openOrdersCount}
            </span>
          ) : null}
        </button>
      </div>

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
              <table className="w-full min-w-[720px] text-left">
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
    </div>
  )
}
