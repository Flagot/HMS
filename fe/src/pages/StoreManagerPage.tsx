import { useCallback, useEffect, useState } from 'react'
import {
  createStockMovement,
  createStoreItem,
  deleteStoreItem,
  fetchLowStockItems,
  fetchStockMovements,
  fetchStoreItems,
  fetchStoreOverview,
  updateStoreItem,
} from '../api/store'
import { StoreDashboardTab } from '../components/store/StoreDashboardTab'
import { StoreInventoryTab } from '../components/store/StoreInventoryTab'
import { StoreLowStockTab } from '../components/store/StoreLowStockTab'
import { StoreMovementsTab } from '../components/store/StoreMovementsTab'
import { PageHeader } from '../components/ui/PageHeader'
import type {
  CreateStockMovementInput,
  CreateStoreItemInput,
  StockMovement,
  StoreCategory,
  StoreItem,
  StoreItemsResult,
  StoreOverview,
  UpdateStoreItemInput,
} from '../types/store'

type StoreTab = 'dashboard' | 'inventory' | 'movements' | 'low-stock'

const tabs: { id: StoreTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'movements', label: 'Stock in/out' },
  { id: 'low-stock', label: 'Low stock' },
]

export function StoreManagerPage() {
  const [tab, setTab] = useState<StoreTab>('dashboard')
  const [overview, setOverview] = useState<StoreOverview | null>(null)
  const [itemsResult, setItemsResult] = useState<StoreItemsResult | null>(null)
  const [catalogItems, setCatalogItems] = useState<StoreItem[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [lowStock, setLowStock] = useState<StoreItemsResult | null>(null)
  const [category, setCategory] = useState<StoreCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOverview = useCallback(async () => {
    setOverview(await fetchStoreOverview())
  }, [])

  const loadInventory = useCallback(async () => {
    setItemsResult(
      await fetchStoreItems({
        category,
        q: query,
      }),
    )
  }, [category, query])

  const loadMovements = useCallback(async () => {
    const [allItems, history] = await Promise.all([
      fetchStoreItems(),
      fetchStockMovements({ limit: 80 }),
    ])
    setCatalogItems(allItems.items)
    setMovements(history)
  }, [])

  const loadLowStock = useCallback(async () => {
    setLowStock(await fetchLowStockItems())
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        await loadOverview()
        if (cancelled) return

        if (tab === 'dashboard') return

        setTabLoading(true)
        if (tab === 'movements') await loadMovements()
        else if (tab === 'low-stock') await loadLowStock()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load store data')
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
  }, [tab, loadOverview, loadMovements, loadLowStock])

  useEffect(() => {
    if (tab !== 'inventory') return
    let cancelled = false

    async function reloadInventory() {
      setTabLoading(true)
      setError(null)
      try {
        await loadInventory()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load inventory')
        }
      } finally {
        if (!cancelled) setTabLoading(false)
      }
    }

    void reloadInventory()
    return () => {
      cancelled = true
    }
  }, [tab, category, query, loadInventory])

  async function refreshAfterChange() {
    await loadOverview()
    if (tab === 'inventory') await loadInventory()
    if (tab === 'movements') await loadMovements()
    if (tab === 'low-stock') await loadLowStock()
  }

  async function handleCreateItem(input: CreateStoreItemInput) {
    setSaving(true)
    setError(null)
    try {
      await createStoreItem(input)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
      throw err
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateItem(id: string, input: UpdateStoreItemInput) {
    setSaving(true)
    setError(null)
    try {
      await updateStoreItem(id, input)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteItem(id: string) {
    setSaving(true)
    setError(null)
    try {
      await deleteStoreItem(id)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateMovement(input: CreateStockMovementInput) {
    setSaving(true)
    setError(null)
    try {
      await createStockMovement(input)
      await refreshAfterChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post movement')
      throw err
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        roleLabel="Store Manager"
        title="Store Inventory"
        subtitle="Manage hotel store stock — catalog items, receive deliveries, issue to departments, and catch low-stock early."
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
        aria-label="Store manager views"
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

      {loading && !overview ? (
        <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
          Loading store…
        </p>
      ) : null}

      {tab === 'dashboard' && overview ? (
        <StoreDashboardTab overview={overview} />
      ) : null}

      {tab === 'inventory' ? (
        <StoreInventoryTab
          result={itemsResult}
          loading={loading || tabLoading}
          saving={saving}
          category={category}
          query={query}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          onCreate={handleCreateItem}
          onUpdate={handleUpdateItem}
          onDelete={handleDeleteItem}
        />
      ) : null}

      {tab === 'movements' ? (
        <StoreMovementsTab
          items={catalogItems}
          movements={movements}
          loading={loading || tabLoading}
          saving={saving}
          onCreate={handleCreateMovement}
        />
      ) : null}

      {tab === 'low-stock' ? (
        <StoreLowStockTab result={lowStock} loading={loading || tabLoading} />
      ) : null}
    </div>
  )
}
