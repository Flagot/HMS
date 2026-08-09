import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { AdminSettings, UpdateAdminSettingsInput } from '../../types/admin'
import { formatPercent } from '../../utils/money'

type AdminSettingsTabProps = {
  settings: AdminSettings | null
  loading?: boolean
  saving?: boolean
  onSave: (input: UpdateAdminSettingsInput) => Promise<void>
}

const portalLinks = [
  { to: '/manager', label: 'Manager' },
  { to: '/store', label: 'Store Manager' },
  { to: '/reception', label: 'Reception' },
  { to: '/waiter', label: 'Waiter' },
  { to: '/kitchen', label: 'Kitchen' },
  { to: '/housekeeping', label: 'Housekeeping' },
]

export function AdminSettingsTab({
  settings,
  loading = false,
  saving = false,
  onSave,
}: AdminSettingsTabProps) {
  const [hotelName, setHotelName] = useState('')

  useEffect(() => {
    if (settings) setHotelName(settings.hotelName)
  }, [settings])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!hotelName.trim()) return
    try {
      await onSave({ hotelName: hotelName.trim() })
    } catch {
      // Parent surfaces error.
    }
  }

  if (loading && !settings) {
    return (
      <p className="rounded-xl border border-hms-border bg-white px-4 py-10 text-center text-sm text-hms-muted shadow-sm">
        Loading settings…
      </p>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Hotel profile
        </h3>
        <p className="mt-1 text-sm text-hms-muted">
          Display name used across the staff portal.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <label className="block min-w-[16rem] flex-1 text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Hotel name
            </span>
            <input
              required
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
          >
            Save
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Pricing defaults
        </h3>
        <p className="mt-1 text-sm text-hms-muted">{settings.note}</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-hms-muted">
              Currency
            </dt>
            <dd className="mt-1 text-lg font-semibold text-hms-navy">
              {settings.currency}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-hms-muted">
              Tax rate
            </dt>
            <dd className="mt-1 text-lg font-semibold text-hms-navy">
              {formatPercent(settings.taxRate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-hms-muted">
              Service charge
            </dt>
            <dd className="mt-1 text-lg font-semibold text-hms-navy">
              {formatPercent(settings.serviceChargeRate)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Staff portals
        </h3>
        <p className="mt-1 text-sm text-hms-muted">
          Jump to operational roles. User login is not required in this build.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {portalLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg border border-hms-border bg-hms-cream/60 px-3 py-2 text-sm font-medium text-hms-navy hover:border-hms-navy hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
