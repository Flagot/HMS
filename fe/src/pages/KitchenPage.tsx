import { useEffect, useMemo, useState } from 'react'
import { fetchKitchenMenu, updateMenuAvailability } from '../api/kitchen'
import { PageHeader } from '../components/ui/PageHeader'
import type { MenuCategory, MenuItem } from '../types/order'
import { formatMoney } from '../utils/money'

const categoryLabels: Record<MenuCategory, string> = {
  drinks: 'Drinks',
  food: 'Food',
  sides: 'Sides',
  dessert: 'Dessert',
}

const categoryOrder: MenuCategory[] = ['drinks', 'food', 'sides', 'dessert']

export function KitchenPage() {
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchKitchenMenu()
        if (!cancelled) setMenu(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load menu')
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

  const grouped = useMemo(
    () =>
      categoryOrder
        .map((category) => ({
          category,
          items: menu.filter((item) => item.category === category),
        }))
        .filter((group) => group.items.length > 0),
    [menu],
  )

  const unavailableCount = menu.filter((item) => !item.available).length

  async function handleToggle(item: MenuItem) {
    setUpdatingId(item.id)
    setError(null)
    try {
      const updated = await updateMenuAvailability(item.id, !item.available)
      setMenu((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        roleLabel="Kitchen"
        title="Menu Availability"
        subtitle="Mark items available or unavailable so waiters can tell guests what can be ordered."
      />

      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-3 text-sm text-hms-muted">
        <span className="rounded-lg border border-hms-border bg-white px-3 py-2 shadow-sm">
          {menu.length} menu items
        </span>
        <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800 shadow-sm">
          {unavailableCount} unavailable
        </span>
      </div>

      {loading ? (
        <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
          Loading menu…
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ category, items }) => (
            <section
              key={category}
              className="overflow-hidden rounded-xl border border-hms-border bg-white shadow-sm"
            >
              <h2 className="border-b border-hms-border bg-hms-cream/60 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-hms-muted">
                {categoryLabels[category]}
              </h2>
              <ul className="divide-y divide-hms-border">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-hms-navy">{item.name}</p>
                      <p className="text-sm text-hms-muted">{formatMoney(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          item.available
                            ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                            : 'bg-red-100 text-red-800 ring-red-200'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                      <button
                        type="button"
                        disabled={updatingId === item.id}
                        onClick={() => void handleToggle(item)}
                        className="rounded-lg border border-hms-border px-3 py-1.5 text-xs font-medium text-hms-navy transition-colors hover:bg-hms-cream disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === item.id
                          ? 'Updating…'
                          : item.available
                            ? 'Mark unavailable'
                            : 'Mark available'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
