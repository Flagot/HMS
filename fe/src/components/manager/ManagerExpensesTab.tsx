import { useState, type FormEvent } from 'react'
import {
  EXPENSE_CATEGORY_OPTIONS,
  type CreateExpenseInput,
  type Expense,
  type ExpenseCategory,
  type ManagerExpensesResult,
} from '../../types/manager'
import { formatMoney } from '../../utils/money'

type ManagerExpensesTabProps = {
  result: ManagerExpensesResult | null
  loading?: boolean
  saving?: boolean
  onCreate: (input: CreateExpenseInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ManagerExpensesTab({
  result,
  loading = false,
  saving = false,
  onCreate,
  onDelete,
}: ManagerExpensesTabProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('other')
  const [amount, setAmount] = useState('')
  const [spentOn, setSpentOn] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = Number(amount)
    if (!title.trim() || !Number.isFinite(value) || value < 0) return
    try {
      await onCreate({
        title: title.trim(),
        category,
        amount: value,
        spentOn,
        note: note.trim() || undefined,
      })
      setTitle('')
      setAmount('')
      setNote('')
    } catch {
      // Parent surfaces error.
    }
  }

  if (loading && !result) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading expenses…
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-hms-navy">
              Expenses this period
            </h3>
            <p className="mt-1 text-sm text-hms-muted">
              Track payroll, supplies, utilities, and other operating costs.
            </p>
          </div>
          {result ? (
            <p className="text-sm text-hms-muted">
              Total{' '}
              <span className="text-lg font-semibold text-hms-navy">
                {formatMoney(result.total)}
              </span>
            </p>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-3 rounded-lg border border-hms-border bg-hms-cream/40 p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <label className="block text-sm lg:col-span-2">
            <span className="mb-1.5 block font-medium text-hms-navy">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              {EXPENSE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Amount</span>
            <input
              required
              type="number"
              min={0}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Date</span>
            <input
              required
              type="date"
              value={spentOn}
              onChange={(e) => setSpentOn(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-4">
            <span className="mb-1.5 block font-medium text-hms-navy">Note (optional)</span>
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
              {saving ? 'Saving…' : 'Add expense'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        {!result || result.expenses.length === 0 ? (
          <p className="text-sm text-hms-muted">No expenses recorded for this period.</p>
        ) : (
          <ul className="divide-y divide-hms-border/70">
            {result.expenses.map((expense: Expense) => (
              <li
                key={expense.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-hms-navy">{expense.title}</p>
                  <p className="text-xs text-hms-muted">
                    {EXPENSE_CATEGORY_OPTIONS.find((o) => o.value === expense.category)
                      ?.label ?? expense.category}{' '}
                    · {expense.spentOn}
                    {expense.note ? ` · ${expense.note}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-hms-navy">
                    {formatMoney(expense.amount)}
                  </p>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void onDelete(expense.id)}
                    className="rounded-lg border border-hms-border px-2.5 py-1 text-xs font-medium text-hms-muted hover:text-red-700 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
