import { useMemo, useState, type FormEvent } from 'react'
import type { CreateOrderInput, MenuItem, OrderType } from '../../types/order'
import { previewOrderTotals } from '../../utils/money'
import { linesFromQuantities, MenuPicker } from './MenuPicker'
import { OrderTotals } from './OrderTotals'

type NewOrderFormProps = {
  menu: MenuItem[]
  isSubmitting: boolean
  onSubmit: (input: CreateOrderInput) => Promise<void>
}

export function NewOrderForm({ menu, isSubmitting, onSubmit }: NewOrderFormProps) {
  const [type, setType] = useState<OrderType>('table')
  const [location, setLocation] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [note, setNote] = useState('')

  const menuById = useMemo(() => new Map(menu.map((item) => [item.id, item])), [menu])
  const preview = useMemo(
    () => previewOrderTotals(quantities, menuById),
    [quantities, menuById],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const items = linesFromQuantities(quantities)
    if (items.length === 0) return

    try {
      await onSubmit({
        type,
        location: location.trim(),
        items,
        note: note.trim() || undefined,
      })
      setLocation('')
      setQuantities({})
      setNote('')
      setType('table')
    } catch {
      // Keep form values; parent surfaces the error.
    }
  }

  const locationLabel = type === 'table' ? 'Table number' : 'Room number'
  const locationPlaceholder = type === 'table' ? 'e.g. 3' : 'e.g. 204'
  const selectedCount = linesFromQuantities(quantities).reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-hms-border bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 className="font-display text-lg font-semibold text-hms-navy">New Order</h2>
      <p className="mt-1 text-sm text-hms-muted">
        Pick available menu items, set quantities, and review tax and service charge before
        placing.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">Service type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as OrderType)}
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm text-hms-navy outline-none focus:border-hms-navy"
          >
            <option value="table">Table</option>
            <option value="room_service">Room service</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">{locationLabel}</span>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={locationPlaceholder}
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm text-hms-navy outline-none focus:border-hms-navy"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-hms-navy">Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Allergies, timing…"
            className="w-full rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-2 text-sm text-hms-navy outline-none focus:border-hms-navy"
          />
        </label>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-hms-navy">Menu</h3>
          <p className="text-xs text-hms-muted">
            {selectedCount > 0 ? `${selectedCount} item(s) selected` : 'Select quantities'}
          </p>
        </div>
        <MenuPicker
          menu={menu}
          quantities={quantities}
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

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || selectedCount === 0}
          className="rounded-lg bg-hms-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-hms-navy-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Placing order…' : 'Place order'}
        </button>
      </div>
    </form>
  )
}
