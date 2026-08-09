import { useMemo, useState } from 'react'
import type { MenuCategory, MenuItem } from '../../types/order'
import { formatMoney } from '../../utils/money'

const categoryLabels: Record<MenuCategory, string> = {
  drinks: 'Drinks',
  food: 'Food',
  sides: 'Sides',
  dessert: 'Dessert',
}

const categoryOrder: MenuCategory[] = ['drinks', 'food', 'sides', 'dessert']

type KitchenAvailabilityPanelProps = {
  menu: MenuItem[]
  loading: boolean
  updatingId: string | null
  onToggle: (item: MenuItem) => void
}

export function KitchenAvailabilityPanel({
  menu,
  loading,
  updatingId,
  onToggle,
}: KitchenAvailabilityPanelProps) {
  const [openCategory, setOpenCategory] = useState<MenuCategory | null>('food')

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

  if (loading) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading menu…
      </p>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3 text-sm text-hms-muted">
        <span className="rounded-lg border border-hms-border bg-white px-3 py-2 shadow-sm">
          {menu.length} menu items
        </span>
        <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800 shadow-sm">
          {unavailableCount} unavailable
        </span>
      </div>

      <div className="space-y-2">
        {grouped.map(({ category, items }) => {
          const isOpen = openCategory === category
          const unavailableInCategory = items.filter((item) => !item.available).length

          return (
            <div
              key={category}
              className="overflow-hidden rounded-xl border border-hms-border bg-white shadow-sm"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenCategory((current) => (current === category ? null : category))
                }
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-hms-cream/40"
              >
                <span className="text-sm font-semibold text-hms-navy">
                  {categoryLabels[category]}
                  <span className="ml-2 font-normal text-hms-muted">({items.length})</span>
                </span>
                <span className="flex items-center gap-2">
                  {unavailableInCategory > 0 ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                      {unavailableInCategory} off
                    </span>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={`text-hms-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    ▾
                  </span>
                </span>
              </button>

              {isOpen ? (
                <ul className="divide-y divide-hms-border border-t border-hms-border">
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
                          onClick={() => onToggle(item)}
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
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
