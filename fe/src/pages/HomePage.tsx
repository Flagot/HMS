import { Link, Navigate } from 'react-router-dom'
import { authClient } from '../lib/auth-client'
import { pathForRole } from '../lib/auth-utils'
import { staffRoles } from '../data/roles'

export function HomePage() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-hms-muted">
        Loading…
      </div>
    )
  }

  if (session?.user) {
    const role = (session.user as { role?: string }).role?.split(',')[0]?.trim()
    return <Navigate to={pathForRole(role)} replace />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <section className="text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-hms-gold">
          Staff portal
        </p>
        <h1 className="font-display text-3xl font-semibold text-hms-navy sm:text-4xl lg:text-5xl">
          Sign in to continue
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-hms-muted sm:text-lg">
          Each staff account is created by an administrator and opens the tools for
          that role.
        </p>
        <div className="mt-8">
          <Link
            to="/login"
            className="inline-flex rounded-lg bg-hms-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-hms-navy-light"
          >
            Staff login
          </Link>
        </div>
      </section>

      <section className="mt-14 border-t border-hms-border pt-10">
        <h2 className="text-center font-display text-xl font-semibold text-hms-navy">
          Available portals
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {staffRoles.map((role) => (
            <li
              key={role.id}
              className="rounded-xl border border-hms-border bg-white px-4 py-3 text-left shadow-sm"
            >
              <p className="font-medium text-hms-navy">{role.title}</p>
              <p className="mt-1 text-sm text-hms-muted">{role.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
