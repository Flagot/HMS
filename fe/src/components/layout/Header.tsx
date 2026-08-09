import { Link, useNavigate } from 'react-router-dom'
import { authClient } from '../../lib/auth-client'

export function Header() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const role = (user as { role?: string } | undefined)?.role?.split(',')[0]?.trim()

  async function handleSignOut() {
    await authClient.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-10 border-b border-hms-border bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-hms-navy font-display text-lg font-semibold text-hms-gold"
            aria-hidden="true"
          >
            H
          </div>
          <div className="text-left">
            <p className="font-display text-lg font-semibold leading-tight text-hms-navy">
              GrandStay HMS
            </p>
            <p className="text-xs text-hms-muted">Hotel Management System</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {!isPending && user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-hms-navy">
                  {(user as { username?: string }).username || user.name}
                </p>
                <p className="text-xs capitalize text-hms-muted">{role}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="rounded-lg border border-hms-border bg-white px-3 py-1.5 text-xs font-medium text-hms-navy hover:border-hms-navy"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-hms-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-hms-navy-light"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
