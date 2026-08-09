import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { MenuItem, Order, UpdateOrderItemsInput } from '../../types/order'
import { previewOrderTotals } from '../../utils/money'
import {
  linesFromQuantities,
  MenuPicker,
  quantitiesFromLines,
} from './MenuPicker'
import { OrderTotals } from './OrderTotals'

type EditOrderFormProps = {
  order: Order
  menu: MenuItem[]
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (input: UpdateOrderItemsInput) => Promise<void>
}

export function EditOrderForm({
  order,
  menu,
  isSubmitting,
  onCancel,
  onSubmit,
}: EditOrderFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    quantitiesFromLines(order.items),
  )
  const [note, setNote] = useState(order.note ?? '')

  const allowUnavailableIds = useMemo(
    () => new Set(order.items.map((item) => item.menuItemId)),
    [order.items],
  )
  const menuById = useMemo(() => new Map(menu.map((item) => [item.id, item])), [menu])
  const preview = useMemo(
    () =>
      previewOrderTotals(
        quantities,
        menuById,
        order.taxRate,
        order.serviceChargeRate,
      ),
    [quantities, menuById, order.taxRate, order.serviceChargeRate],
  )

  useEffect(() => {
    setQuantities(quantitiesFromLines(order.items))
    setNote(order.note ?? '')
  }, [order])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const items = linesFromQuantities(quantities)
    if (items.length === 0) return

    try {
      await onSubmit({
        items,
        note: note.trim() || undefined,
      })
    } catch {
      // Keep form values; parent surfaces the error.
    }
  }

  const selectedCount = linesFromQuantities(quantities).reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-hms-navy/20 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-hms-navy">
            Edit {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-hms-muted">
            {order.type === 'table' ? 'Table' : 'Room'} {order.location} — add or remove items.
            Totals update as you change quantities.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hms-border px-3 py-1.5 text-xs font-medium text-hms-muted hover:text-hms-navy"
        >
          Cancel
        </button>
      </div>

      <label className="mt-5 block text-sm sm:max-w-sm">
        <span className="mb-1.5 block font-medium text-hms-navy">Note (optional)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Allergies, timing…"
          className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm text-hms-navy outline-none focus:border-hms-navy"
        />
      </label>

      <div className="mt-6">
        <MenuPicker
          menu={menu}
          quantities={quantities}
          allowUnavailableIds={allowUnavailableIds}
          onChange={(menuItemId, quantity) =>
            setQuantities((prev) => {
              const next = { ...prev }
              if (quantity <= 0) delete next[menuItemId]
              else next[menuItemId] = quantity
              return next
            })
          }
        />
      </div>

      {selectedCount > 0 ? (
        <div className="mt-5">
          <OrderTotals {...preview} />
        </div>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-hms-border px-4 py-2.5 text-sm font-medium text-hms-navy"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || selectedCount === 0}
          className="rounded-lg bg-hms-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-hms-navy-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
