import { useCallback, useEffect, useState } from 'react'
import {
  fetchAdminPayroll,
  markPayrollPaid,
  unmarkPayrollPaid,
  updatePayrollProfile,
  type AdminPayroll,
  type PayrollEmployee,
} from '../../api/admin'
import { staffRoles } from '../../data/roles'
import { formatMoney } from '../../utils/money'
import { ConfirmDialog } from '../ui/ConfirmDialog'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

function roleLabel(role: string) {
  return staffRoles.find((r) => r.id === role)?.title ?? role
}

function monthLabel(month: string) {
  const [year, mon] = month.split('-').map(Number)
  return new Date(Date.UTC(year, mon - 1, 1)).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function ordinal(day: number) {
  const rem10 = day % 10
  const rem100 = day % 100
  if (rem10 === 1 && rem100 !== 11) return `${day}st`
  if (rem10 === 2 && rem100 !== 12) return `${day}nd`
  if (rem10 === 3 && rem100 !== 13) return `${day}rd`
  return `${day}th`
}

function StatusTag({ employee }: { employee: PayrollEmployee }) {
  if (employee.payStatus === 'paid') {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
        Paid · {formatShortDate(employee.record?.paidOn ?? '')}
      </span>
    )
  }
  if (employee.payStatus === 'overdue') {
    return (
      <span className="inline-flex items-center rounded-full border border-rose-300 bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
        Overdue · {employee.daysOverdue}{' '}
        {employee.daysOverdue === 1 ? 'day' : 'days'}
      </span>
    )
  }
  if (employee.payStatus === 'due') {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
        Due today
      </span>
    )
  }
  if (employee.payStatus === 'upcoming') {
    return (
      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">
        Due {employee.dueDate ? formatShortDate(employee.dueDate) : ''}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border border-hms-border bg-hms-cream px-2.5 py-0.5 text-xs font-medium text-hms-muted">
      Unpaid
    </span>
  )
}

type PayrollRowProps = {
  employee: PayrollEmployee
  busy: boolean
  onPay: (employee: PayrollEmployee, amount: number) => void
  onUndo: (employee: PayrollEmployee) => void
  onSaveProfile: (
    employee: PayrollEmployee,
    salary: number,
    payDay: number,
  ) => Promise<void>
}

function PayrollRow({
  employee,
  busy,
  onPay,
  onUndo,
  onSaveProfile,
}: PayrollRowProps) {
  const [amount, setAmount] = useState(
    employee.suggestedAmount !== null ? String(employee.suggestedAmount) : '',
  )
  const [editing, setEditing] = useState(false)
  const [salaryInput, setSalaryInput] = useState(
    employee.salary !== null ? String(employee.salary) : '',
  )
  const [payDayInput, setPayDayInput] = useState(
    employee.payDay !== null ? String(employee.payDay) : '',
  )

  const parsedAmount = Number(amount)
  const validAmount =
    amount !== '' && Number.isFinite(parsedAmount) && parsedAmount >= 0

  const parsedSalary = Number(salaryInput)
  const parsedPayDay = Number(payDayInput)
  const validProfile =
    salaryInput !== '' &&
    Number.isFinite(parsedSalary) &&
    parsedSalary >= 0 &&
    Number.isInteger(parsedPayDay) &&
    parsedPayDay >= 1 &&
    parsedPayDay <= 31

  async function saveProfile() {
    await onSaveProfile(employee, parsedSalary, parsedPayDay)
    setEditing(false)
    setAmount(String(parsedSalary))
  }

  const overdueRow = employee.payStatus === 'overdue'

  return (
    <tr
      className={`border-b border-hms-border/70 last:border-0 ${
        overdueRow ? 'bg-rose-50/50' : ''
      }`}
    >
      <td className="py-3 pr-3">
        <p className="font-medium text-hms-navy">
          {employee.name}
          {employee.deactivated ? (
            <span className="ml-2 rounded-full bg-hms-cream px-2 py-0.5 text-[11px] font-medium text-hms-muted">
              Deactivated
            </span>
          ) : null}
        </p>
        <p className="text-xs text-hms-muted">@{employee.username}</p>
      </td>
      <td className="py-3 pr-3 text-sm text-hms-muted">
        {roleLabel(employee.role)}
      </td>
      <td className="py-3 pr-3 text-sm">
        {editing ? (
          <input
            type="number"
            min={1}
            max={31}
            placeholder="Day"
            value={payDayInput}
            onChange={(e) => setPayDayInput(e.target.value)}
            className="w-16 rounded-lg border border-hms-border bg-white px-2 py-1.5 text-sm outline-none focus:border-hms-navy"
          />
        ) : employee.payDay ? (
          <span className="text-hms-navy">{ordinal(employee.payDay)}</span>
        ) : (
          <span className="text-hms-muted">—</span>
        )}
      </td>
      <td className="py-3 pr-3 text-right text-sm">
        {editing ? (
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="Salary"
            value={salaryInput}
            onChange={(e) => setSalaryInput(e.target.value)}
            className="w-28 rounded-lg border border-hms-border bg-white px-2.5 py-1.5 text-right text-sm outline-none focus:border-hms-navy"
          />
        ) : employee.salary !== null ? (
          <span className="font-medium text-hms-navy tabular-nums">
            {formatMoney(employee.salary)}
          </span>
        ) : (
          <span className="text-hms-muted">—</span>
        )}
      </td>
      <td className="py-3 pr-3">
        <StatusTag employee={employee} />
      </td>
      <td className="py-3 pr-3 text-right">
        {employee.paid ? (
          <span className="text-sm font-semibold text-hms-navy tabular-nums">
            {formatMoney(employee.record?.amount ?? 0)}
          </span>
        ) : (
          <input
            type="number"
            min={0}
            step={0.01}
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 rounded-lg border border-hms-border bg-white px-2.5 py-1.5 text-right text-sm outline-none focus:border-hms-navy"
          />
        )}
      </td>
      <td className="py-3 text-right">
        <div className="flex justify-end gap-1.5">
          {editing ? (
            <>
              <button
                type="button"
                disabled={busy || !validProfile}
                onClick={() => void saveProfile()}
                className="rounded-lg bg-hms-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-hms-navy-light disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditing(false)
                  setSalaryInput(
                    employee.salary !== null ? String(employee.salary) : '',
                  )
                  setPayDayInput(
                    employee.payDay !== null ? String(employee.payDay) : '',
                  )
                }}
                className="rounded-lg border border-hms-border px-2.5 py-1.5 text-xs font-medium text-hms-muted hover:text-hms-navy disabled:opacity-60"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {employee.paid ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onUndo(employee)}
                  className="rounded-lg border border-hms-border px-2.5 py-1.5 text-xs font-medium text-hms-muted hover:text-red-700 disabled:opacity-60"
                >
                  Undo
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || !validAmount}
                  onClick={() => onPay(employee, parsedAmount)}
                  className="rounded-lg bg-hms-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-hms-navy-light disabled:opacity-50"
                >
                  Mark paid
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(true)}
                className="rounded-lg border border-hms-border px-2.5 py-1.5 text-xs font-medium text-hms-muted hover:text-hms-navy disabled:opacity-60"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export function AdminPayrollTab() {
  const [month, setMonth] = useState(currentMonth)
  const [payroll, setPayroll] = useState<AdminPayroll | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingPay, setPendingPay] = useState<{
    employee: PayrollEmployee
    amount: number
  } | null>(null)
  const [pendingUndo, setPendingUndo] = useState<PayrollEmployee | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setPayroll(await fetchAdminPayroll(month))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payroll')
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  async function confirmPay() {
    if (!pendingPay) return
    setBusy(true)
    setError(null)
    try {
      await markPayrollPaid(pendingPay.employee.userId, {
        month,
        amount: pendingPay.amount,
      })
      setPendingPay(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as paid')
      setPendingPay(null)
    } finally {
      setBusy(false)
    }
  }

  async function confirmUndo() {
    if (!pendingUndo) return
    setBusy(true)
    setError(null)
    try {
      await unmarkPayrollPaid(pendingUndo.userId, month)
      setPendingUndo(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to undo payment')
      setPendingUndo(null)
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveProfile(
    employee: PayrollEmployee,
    salary: number,
    payDay: number,
  ) {
    setBusy(true)
    setError(null)
    try {
      await updatePayrollProfile(employee.userId, { salary, payDay })
      await load()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save payroll settings',
      )
      throw err
    } finally {
      setBusy(false)
    }
  }

  const summary = payroll?.summary
  const attention = (summary?.dueCount ?? 0) + (summary?.overdueCount ?? 0)

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-hms-navy">
              Payroll — {monthLabel(month)}
            </h3>
            <p className="mt-1 text-sm text-hms-muted">
              Set each employee's salary and pay day with Edit. Marking a
              salary as paid also records a payroll expense.
            </p>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Month</span>
            <input
              type="month"
              value={month}
              max={currentMonth()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              className="rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
        </div>

        {summary ? (
          <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-3">
              <dt className="text-xs uppercase tracking-wide text-hms-muted">
                Employees
              </dt>
              <dd className="mt-1 text-xl font-semibold text-hms-navy">
                {summary.employeeCount}
              </dd>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-3">
              <dt className="text-xs uppercase tracking-wide text-emerald-800/80">
                Paid
              </dt>
              <dd className="mt-1 text-xl font-semibold text-emerald-900">
                {summary.paidCount}
              </dd>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-3">
              <dt className="text-xs uppercase tracking-wide text-amber-900/80">
                Unpaid
              </dt>
              <dd className="mt-1 text-xl font-semibold text-amber-950">
                {summary.unpaidCount}
              </dd>
            </div>
            <div
              className={`rounded-lg border px-3 py-3 ${
                summary.overdueCount > 0
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-hms-border bg-hms-cream/40'
              }`}
            >
              <dt
                className={`text-xs uppercase tracking-wide ${
                  summary.overdueCount > 0
                    ? 'text-rose-800/80'
                    : 'text-hms-muted'
                }`}
              >
                Overdue
              </dt>
              <dd
                className={`mt-1 text-xl font-semibold ${
                  summary.overdueCount > 0 ? 'text-rose-800' : 'text-hms-navy'
                }`}
              >
                {summary.overdueCount}
              </dd>
            </div>
            <div className="rounded-lg border border-hms-border bg-hms-cream/40 px-3 py-3">
              <dt className="text-xs uppercase tracking-wide text-hms-muted">
                Total paid out
              </dt>
              <dd className="mt-1 text-xl font-semibold text-hms-navy">
                {formatMoney(summary.totalPaid)}
              </dd>
            </div>
          </dl>
        ) : null}

        {attention > 0 ? (
          <p
            role="status"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          >
            {summary?.overdueCount
              ? `${summary.overdueCount} ${summary.overdueCount === 1 ? 'salary is' : 'salaries are'} overdue. `
              : ''}
            {summary?.dueCount
              ? `${summary.dueCount} ${summary.dueCount === 1 ? 'salary is' : 'salaries are'} due today.`
              : ''}
          </p>
        ) : null}
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}

      <section className="overflow-x-auto rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        {loading && !payroll ? (
          <p className="py-6 text-center text-sm text-hms-muted">
            Loading payroll…
          </p>
        ) : !payroll || payroll.employees.length === 0 ? (
          <p className="py-6 text-center text-sm text-hms-muted">
            No employees found.
          </p>
        ) : (
          <table className="w-full min-w-175 text-left">
            <thead>
              <tr className="border-b border-hms-border text-xs uppercase tracking-wide text-hms-muted">
                <th className="pb-2 pr-3 font-medium">Employee</th>
                <th className="pb-2 pr-3 font-medium">Role</th>
                <th className="pb-2 pr-3 font-medium">Pay day</th>
                <th className="pb-2 pr-3 text-right font-medium">Salary</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 pr-3 text-right font-medium">Amount</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payroll.employees.map((employee) => (
                <PayrollRow
                  key={`${employee.userId}-${month}-${employee.paid}-${employee.salary}-${employee.payDay}`}
                  employee={employee}
                  busy={busy}
                  onPay={(emp, amount) => setPendingPay({ employee: emp, amount })}
                  onUndo={setPendingUndo}
                  onSaveProfile={handleSaveProfile}
                />
              ))}
            </tbody>
          </table>
        )}
      </section>

      <ConfirmDialog
        open={pendingPay !== null}
        title="Mark salary as paid?"
        description={
          pendingPay
            ? `Pay ${pendingPay.employee.name} ${formatMoney(pendingPay.amount)} for ${monthLabel(month)}?\nThis will also record a payroll expense.`
            : ''
        }
        confirmLabel="Mark paid"
        tone="success"
        busy={busy}
        onConfirm={() => void confirmPay()}
        onCancel={() => setPendingPay(null)}
      />

      <ConfirmDialog
        open={pendingUndo !== null}
        title="Undo this payment?"
        description={
          pendingUndo
            ? `Remove the ${monthLabel(month)} payment record for ${pendingUndo.name}?\nThe linked payroll expense will also be deleted.`
            : ''
        }
        confirmLabel="Undo payment"
        tone="danger"
        busy={busy}
        onConfirm={() => void confirmUndo()}
        onCancel={() => setPendingUndo(null)}
      />
    </div>
  )
}
