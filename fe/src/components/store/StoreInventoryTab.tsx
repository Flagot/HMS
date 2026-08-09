import { useState, type FormEvent } from 'react'
import {
  STORE_CATEGORIES,
  STORE_CATEGORY_OPTIONS,
  STORE_UNITS,
  categoryLabel,
  type CreateStoreItemInput,
  type StoreCategory,
  type StoreItem,
  type StoreItemsResult,
  type StoreUnit,
  type UpdateStoreItemInput,
} from '../../types/store'
import { formatMoney } from '../../utils/money'

type StoreInventoryTabProps = {
  result: StoreItemsResult | null
  loading?: boolean
  saving?: boolean
  category: StoreCategory | 'all'
  query: string
  onCategoryChange: (category: StoreCategory | 'all') => void
  onQueryChange: (query: string) => void
  onCreate: (input: CreateStoreItemInput) => Promise<void>
  onUpdate: (id: string, input: UpdateStoreItemInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function StoreInventoryTab({
  result,
  loading = false,
  saving = false,
  category,
  query,
  onCategoryChange,
  onQueryChange,
  onCreate,
  onUpdate,
  onDelete,
}: StoreInventoryTabProps) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [newCategory, setNewCategory] = useState<StoreCategory>('housekeeping')
  const [unit, setUnit] = useState<StoreUnit>('pcs')
  const [quantityOnHand, setQuantityOnHand] = useState('0')
  const [reorderLevel, setReorderLevel] = useState('10')
  const [unitCost, setUnitCost] = useState('')
  const [note, setNote] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editReorder, setEditReorder] = useState('')
  const [editCost, setEditCost] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const qty = Number(quantityOnHand)
    const reorder = Number(reorderLevel)
    const cost = Number(unitCost || 0)
    if (!name.trim() || !sku.trim()) return
    if (!Number.isFinite(qty) || qty < 0) return
    if (!Number.isFinite(reorder) || reorder < 0) return
    if (!Number.isFinite(cost) || cost < 0) return

    try {
      await onCreate({
        name: name.trim(),
        sku: sku.trim(),
        category: newCategory,
        unit,
        quantityOnHand: qty,
        reorderLevel: reorder,
        unitCost: cost,
        note: note.trim() || undefined,
      })
      setName('')
      setSku('')
      setQuantityOnHand('0')
      setReorderLevel('10')
      setUnitCost('')
      setNote('')
    } catch {
      // Parent surfaces error.
    }
  }

  function startEdit(item: StoreItem) {
    setEditingId(item.id)
    setEditReorder(String(item.reorderLevel))
    setEditCost(String(item.unitCost))
  }

  async function saveEdit(item: StoreItem) {
    const reorder = Number(editReorder)
    const cost = Number(editCost)
    if (!Number.isFinite(reorder) || reorder < 0) return
    if (!Number.isFinite(cost) || cost < 0) return
    await onUpdate(item.id, { reorderLevel: reorder, unitCost: cost })
    setEditingId(null)
  }

  if (loading && !result) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading inventory…
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-hms-navy">
              Inventory catalog
            </h3>
            <p className="mt-1 text-sm text-hms-muted">
              Add items and keep reorder levels and unit costs up to date.
            </p>
          </div>
          {result ? (
            <p className="text-sm text-hms-muted">
              Showing{' '}
              <span className="font-semibold text-hms-navy">{result.total}</span>
              {' · '}
              Value{' '}
              <span className="font-semibold text-hms-navy">
                {formatMoney(result.totalStockValue)}
              </span>
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="block min-w-[10rem] flex-1 text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Search</span>
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Name or SKU"
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Category</span>
            <select
              value={category}
              onChange={(e) =>
                onCategoryChange(e.target.value as StoreCategory | 'all')
              }
              className="rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              <option value="all">All</option>
              {STORE_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {categoryLabel(value)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-3 rounded-lg border border-hms-border bg-hms-cream/40 p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="block text-sm lg:col-span-2">
            <span className="mb-1.5 block font-medium text-hms-navy">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">SKU</span>
            <input
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Category</span>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as StoreCategory)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              {STORE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Unit</span>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as StoreUnit)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              {STORE_UNITS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Opening qty</span>
            <input
              type="number"
              min={0}
              step={1}
              value={quantityOnHand}
              onChange={(e) => setQuantityOnHand(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Reorder at</span>
            <input
              type="number"
              min={0}
              step={1}
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Unit cost</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-3">
            <span className="mb-1.5 block font-medium text-hms-navy">Note</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
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
                <th className="px-4 py-3 font-medium">On hand</th>
                <th className="px-4 py-3 font-medium">Reorder</th>
                <th className="px-4 py-3 font-medium">Unit cost</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(result?.items ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-hms-muted"
                  >
                    No items match this filter.
                  </td>
                </tr>
              ) : (
                result?.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-hms-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-hms-navy">{item.name}</p>
                      <p className="text-xs text-hms-muted">{item.sku}</p>
                      {item.isLowStock ? (
                        <span className="mt-1 inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-rose-700">
                          Low stock
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-hms-muted">
                      {categoryLabel(item.category)}
                    </td>
                    <td className="px-4 py-3 text-hms-navy">
                      {item.quantityOnHand} {item.unit}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min={0}
                          value={editReorder}
                          onChange={(e) => setEditReorder(e.target.value)}
                          className="w-20 rounded border border-hms-border px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-hms-muted">{item.reorderLevel}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={editCost}
                          onChange={(e) => setEditCost(e.target.value)}
                          className="w-24 rounded border border-hms-border px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-hms-muted">
                          {formatMoney(item.unitCost)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-hms-navy">
                      {formatMoney(item.stockValue)}
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
