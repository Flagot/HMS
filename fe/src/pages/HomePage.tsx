import { Link, Navigate } from 'react-router-dom'
import { staffRoles } from '../data/roles'
import { authClient } from '../lib/auth-client'
import { pathForRole } from '../lib/auth-utils'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2400&q=80'

export function HomePage() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-hms-navy text-sm text-white/70">
        Loading…
      </div>
    )
  }

  if (session?.user) {
    const role = (session.user as { role?: string }).role?.split(',')[0]?.trim()
    return <Navigate to={pathForRole(role)} replace />
  }

  return (
    <div className="relative">
      <section className="relative isolate min-h-svh overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt=""
            className="landing-ken h-full w-full object-cover object-center animate-landing-ken"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(12,20,36,0.88)_0%,rgba(12,20,36,0.62)_42%,rgba(12,20,36,0.28)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,20,36,0.72)_0%,transparent_42%)]" />
        </div>

        <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24">
          <div className="max-w-2xl">
            <p className="landing-motion font-display text-5xl font-semibold tracking-tight text-white animate-landing-fade sm:text-6xl lg:text-7xl">
              GrandStay
              <span className="text-hms-gold"> HMS</span>
            </p>
            <div
              aria-hidden="true"
              className="landing-motion mt-5 h-px w-24 origin-left bg-hms-gold animate-landing-line"
            />
            <h1 className="landing-motion mt-6 max-w-xl text-xl font-medium leading-snug text-white/92 animate-landing-fade-delay sm:text-2xl">
              Run the hotel from one calm staff portal.
            </h1>
            <p className="landing-motion mt-4 max-w-lg text-base leading-relaxed text-white/70 animate-landing-fade-late sm:text-lg">
              Sign in with your staff account and open straight into the tools
              for your department.
            </p>
            <div className="landing-motion mt-10 animate-landing-fade-late">
              <Link
                to="/login"
                className="inline-flex rounded-lg bg-hms-gold px-7 py-3.5 text-sm font-semibold text-hms-navy transition hover:bg-[#d4b56e]"
              >
                Sign in to continue
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#121c2f] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-hms-gold">
              Staff roles
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
              Who works in the system
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/60">
              Each account is assigned one role. After sign-in, staff land in the
              workspace that matches their responsibility.
            </p>
          </div>

          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {staffRoles.map((role) => (
              <li key={role.id} className="border-t border-white/15 pt-5">
                <h3 className="font-display text-lg font-semibold text-white">
                  {role.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {role.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0d1524] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/50">
            Accounts are created by an administrator — there is no public signup.
          </p>
          <p className="text-xs tracking-wide text-white/35">
            © {new Date().getFullYear()} GrandStay HMS
          </p>
        </div>
      </footer>
    </div>
  )
}
