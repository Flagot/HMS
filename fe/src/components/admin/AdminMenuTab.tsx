import { useState, type FormEvent } from 'react'
import {
  MENU_CATEGORY_OPTIONS,
  MENU_MEAL_OPTIONS,
  type AdminMenuItem,
  type CreateAdminMenuItemInput,
  type UpdateAdminMenuItemInput,
} from '../../types/admin'
import { formatMoney } from '../../utils/money'

type AdminMenuTabProps = {
  items: AdminMenuItem[]
  loading?: boolean
  saving?: boolean
  onCreate: (input: CreateAdminMenuItemInput) => Promise<void>
  onUpdate: (id: string, input: UpdateAdminMenuItemInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function AdminMenuTab({
  items,
  loading = false,
  saving = false,
  onCreate,
  onUpdate,
  onDelete,
}: AdminMenuTabProps) {
  const [name, setName] = useState('')
  const [category, setCategory] =
    useState<AdminMenuItem['category']>('food')
  const [meals, setMeals] = useState<AdminMenuItem['meals']>(['lunch', 'dinner'])
  const [price, setPrice] = useState('')
  const [available, setAvailable] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editCategory, setEditCategory] =
    useState<AdminMenuItem['category']>('food')

  function toggleMeal(meal: AdminMenuItem['meals'][number]) {
    setMeals((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal],
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(price)
    if (!name.trim() || meals.length === 0) return
    if (!Number.isFinite(value) || value < 0) return

    try {
      await onCreate({
        name: name.trim(),
        category,
        meals,
        price: value,
        available,
      })
      setName('')
      setPrice('')
      setAvailable(true)
    } catch {
      // Parent surfaces error.
    }
  }

  function startEdit(item: AdminMenuItem) {
    setEditingId(item.id)
    setEditName(item.name)
    setEditPrice(String(item.price))
    setEditCategory(item.category)
  }

  async function saveEdit(item: AdminMenuItem) {
    const value = Number(editPrice)
    if (!editName.trim() || !Number.isFinite(value) || value < 0) return
    await onUpdate(item.id, {
      name: editName.trim(),
      price: value,
      category: editCategory,
    })
    setEditingId(null)
  }

  if (loading && items.length === 0) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading menu…
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Menu catalog
        </h3>
        <p className="mt-1 text-sm text-hms-muted">
          Create and price F&B items. Kitchen can still toggle availability during
          service.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-3 rounded-lg border border-hms-border bg-hms-cream/40 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block font-medium text-hms-navy">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Category</span>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as AdminMenuItem['category'])
              }
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              {MENU_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Price</span>
            <input
              required
              type="number"
              min={0}
              step={0.01}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <fieldset className="sm:col-span-2 lg:col-span-3">
            <legend className="mb-1.5 text-sm font-medium text-hms-navy">
              Meal periods
            </legend>
            <div className="flex flex-wrap gap-3">
              {MENU_MEAL_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="inline-flex items-center gap-2 text-sm text-hms-navy"
                >
                  <input
                    type="checkbox"
                    checked={meals.includes(option.value)}
                    onChange={() => toggleMeal(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="inline-flex items-end gap-2 pb-2 text-sm text-hms-navy">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            Available
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving || meals.length === 0}
              className="w-full rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
            >
              Add item
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-hms-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-hms-border bg-hms-cream/50 text-xs uppercase tracking-wide text-hms-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Meals</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-hms-muted"
                  >
                    No menu items yet.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-hms-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full rounded border border-hms-border px-2 py-1 text-sm"
                        />
                      ) : (
                        <>
                          <p className="font-medium text-hms-navy">{item.name}</p>
                          <p className="text-xs text-hms-muted">{item.id}</p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <select
                          value={editCategory}
                          onChange={(e) =>
                            setEditCategory(
                              e.target.value as AdminMenuItem['category'],
                            )
                          }
                          className="rounded border border-hms-border px-2 py-1 text-sm"
                        >
                          {MENU_CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="capitalize text-hms-muted">
                          {item.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-hms-muted">
                      {item.meals.join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 rounded border border-hms-border px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-hms-navy">
                          {formatMoney(item.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          void onUpdate(item.id, { available: !item.available })
                        }
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          item.available
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-hms-cream text-hms-muted'
                        }`}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {editingId === item.id ? (
                          <>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void saveEdit(item)}
                              className="rounded-lg bg-hms-navy px-2.5 py-1 text-xs font-medium text-white disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="rounded-lg border border-hms-border px-2.5 py-1 text-xs font-medium text-hms-muted"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded-lg border border-hms-border px-2.5 py-1 text-xs font-medium text-hms-navy hover:bg-hms-cream"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void onDelete(item.id)}
                          className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
