import { useState, type FormEvent } from 'react'
import {
  STORE_DEPARTMENT_OPTIONS,
  departmentLabel,
  movementTypeLabel,
  type CreateStockMovementInput,
  type StockMovement,
  type StockMovementType,
  type StoreDepartment,
  type StoreItem,
} from '../../types/store'

type StoreMovementsTabProps = {
  items: StoreItem[]
  movements: StockMovement[]
  loading?: boolean
  saving?: boolean
  onCreate: (input: CreateStockMovementInput) => Promise<void>
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function StoreMovementsTab({
  items,
  movements,
  loading = false,
  saving = false,
  onCreate,
}: StoreMovementsTabProps) {
  const [itemId, setItemId] = useState('')
  const [type, setType] = useState<StockMovementType>('receive')
  const [quantity, setQuantity] = useState('')
  const [department, setDepartment] = useState<StoreDepartment>('kitchen')
  const [note, setNote] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const qty = Number(quantity)
    if (!itemId || !Number.isFinite(qty) || qty <= 0) return

    try {
      await onCreate({
        itemId,
        type,
        quantity: qty,
        department: type === 'issue' ? department : undefined,
        note: note.trim() || undefined,
      })
      setQuantity('')
      setNote('')
    } catch {
      // Parent surfaces error.
    }
  }

  if (loading && movements.length === 0 && items.length === 0) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading movements…
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Record stock movement
        </h3>
        <p className="mt-1 text-sm text-hms-muted">
          Receive deliveries, issue to departments, or set an absolute balance with
          adjust.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-3 rounded-lg border border-hms-border bg-hms-cream/40 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <label className="block text-sm sm:col-span-2 lg:col-span-2">
            <span className="mb-1.5 block font-medium text-hms-navy">Item</span>
            <select
              required
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              <option value="">Select item…</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku}) — {item.quantityOnHand} {item.unit}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as StockMovementType)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              <option value="receive">Receive</option>
              <option value="issue">Issue</option>
              <option value="adjust">Adjust (set balance)</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">
              {type === 'adjust' ? 'New balance' : 'Quantity'}
            </span>
            <input
              required
              type="number"
              min={type === 'adjust' ? 0 : 1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          {type === 'issue' ? (
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-hms-navy">
                Department
              </span>
              <select
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value as StoreDepartment)
                }
                className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
              >
                {STORE_DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="block text-sm sm:col-span-2">
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
              disabled={saving || items.length === 0}
              className="w-full rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
            >
              Post movement
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-hms-border bg-white shadow-sm">
        <div className="border-b border-hms-border px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Movement history
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-hms-border bg-hms-cream/50 text-xs uppercase tracking-wide text-hms-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-hms-muted"
                  >
                    No movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-b border-hms-border last:border-0"
                  >
                    <td className="px-4 py-3 text-hms-muted">
                      {formatWhen(movement.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-hms-navy">
                        {movement.itemName}
                      </p>
                      <p className="text-xs text-hms-muted">{movement.itemSku}</p>
                    </td>
                    <td className="px-4 py-3 text-hms-navy">
                      {movementTypeLabel(movement.type)}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold tabular-nums ${
                        movement.quantity < 0
                          ? 'text-rose-700'
                          : movement.quantity > 0
                            ? 'text-emerald-700'
                            : 'text-hms-navy'
                      }`}
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity}
                    </td>
                    <td className="px-4 py-3 text-hms-navy">
                      {movement.balanceAfter}
                    </td>
                    <td className="px-4 py-3 text-hms-muted">
                      {movement.department
                        ? departmentLabel(movement.department)
                        : '—'}
                      {movement.note ? ` · ${movement.note}` : ''}
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
