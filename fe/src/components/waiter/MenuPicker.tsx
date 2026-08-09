import { useMemo, useState } from 'react'
import type { MenuCategory, MenuItem, MenuMeal } from '../../types/order'
import { formatMoney } from '../../utils/money'

const categoryLabels: Record<MenuCategory, string> = {
  drinks: 'Drinks',
  food: 'Food',
  sides: 'Sides',
  dessert: 'Dessert',
}

const mealLabels: Record<MenuMeal, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
}

const categoryOrder: MenuCategory[] = ['drinks', 'food', 'sides', 'dessert']
const mealOrder: MenuMeal[] = ['breakfast', 'lunch', 'dinner']

type MenuPickerProps = {
  menu: MenuItem[]
  quantities: Record<string, number>
  onChange: (menuItemId: string, quantity: number) => void
  /** Items already on an order may keep qty even if now unavailable */
  allowUnavailableIds?: Set<string>
}

function selectedCountFor(
  items: MenuItem[],
  quantities: Record<string, number>,
): number {
  return items.reduce((sum, item) => sum + (quantities[item.id] ?? 0), 0)
}

export function MenuPicker({
  menu,
  quantities,
  onChange,
  allowUnavailableIds,
}: MenuPickerProps) {
  const [meal, setMeal] = useState<MenuMeal>('lunch')
  const [openCategory, setOpenCategory] = useState<MenuCategory | null>(null)

  const mealMenu = useMemo(
    () => menu.filter((item) => item.meals.includes(meal)),
    [menu, meal],
  )

  const grouped = useMemo(
    () =>
      categoryOrder
        .map((category) => ({
          category,
          items: mealMenu.filter((item) => item.category === category),
        }))
        .filter((group) => group.items.length > 0),
    [mealMenu],
  )

  function handleMealChange(next: MenuMeal) {
    setMeal(next)
    setOpenCategory(null)
  }

  function toggleCategory(category: MenuCategory) {
    setOpenCategory((current) => (current === category ? null : category))
  }

  function canAdjust(item: MenuItem, nextQuantity: number): boolean {
    if (item.available) return true
    if (!allowUnavailableIds?.has(item.id)) return false
    const current = quantities[item.id] ?? 0
    return nextQuantity <= current
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Meal period"
        className="flex gap-1 rounded-xl border border-hms-border bg-hms-cream/60 p-1"
      >
        {mealOrder.map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={meal === value}
            onClick={() => handleMealChange(value)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              meal === value
                ? 'bg-white text-hms-navy shadow-sm'
                : 'text-hms-muted hover:text-hms-navy'
            }`}
          >
            {mealLabels[value]}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-lg border border-hms-border bg-hms-cream/30 px-4 py-6 text-center text-sm text-hms-muted">
          No items for {mealLabels[meal].toLowerCase()}.
        </p>
      ) : (
        <div className="space-y-2">
          {grouped.map(({ category, items }) => {
            const isOpen = openCategory === category
            const selectedInCategory = selectedCountFor(items, quantities)

            return (
              <div
                key={category}
                className="overflow-hidden rounded-xl border border-hms-border bg-white"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-hms-cream/40"
                >
                  <span className="text-sm font-semibold text-hms-navy">
                    {categoryLabels[category]}
                    <span className="ml-2 font-normal text-hms-muted">
                      ({items.length})
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    {selectedInCategory > 0 ? (
                      <span className="rounded-full bg-hms-navy/10 px-2 py-0.5 text-xs font-semibold text-hms-navy">
                        {selectedInCategory} selected
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
                  <ul className="grid gap-2 border-t border-hms-border bg-hms-cream/20 p-3 sm:grid-cols-2">
                    {items.map((item) => {
                      const quantity = quantities[item.id] ?? 0
                      const unavailable = !item.available
                      const canIncrease = canAdjust(item, quantity + 1)

                      return (
                        <li
                          key={item.id}
                          className={`rounded-lg border px-3 py-2 ${
                            unavailable
                              ? 'border-red-200 bg-red-50/60'
                              : 'border-hms-border bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-hms-navy">{item.name}</p>
                              <p className="mt-0.5 text-xs text-hms-muted">
                                {formatMoney(item.price)}
                              </p>
                              <p
                                className={`mt-1 text-[11px] font-medium uppercase tracking-wide ${
                                  unavailable ? 'text-red-700' : 'text-emerald-700'
                                }`}
                              >
                                {unavailable ? 'Unavailable' : 'Available'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label={`Decrease ${item.name}`}
                                disabled={quantity === 0}
                                onClick={() =>
                                  onChange(item.id, Math.max(0, quantity - 1))
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-hms-border bg-white text-sm font-semibold text-hms-navy transition-colors hover:bg-hms-cream disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm font-semibold text-hms-navy">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`Increase ${item.name}`}
                                disabled={!canIncrease}
                                onClick={() => onChange(item.id, quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-hms-border bg-white text-sm font-semibold text-hms-navy transition-colors hover:bg-hms-cream disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function quantitiesFromLines(
  items: { menuItemId: string; quantity: number }[],
): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.menuItemId, item.quantity]))
}

export function linesFromQuantities(
  quantities: Record<string, number>,
): { menuItemId: string; quantity: number }[] {
  return Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([menuItemId, quantity]) => ({ menuItemId, quantity }))
}
