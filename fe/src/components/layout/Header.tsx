import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useHotelBrand } from '../../hotel/HotelBrandContext'
import { authClient } from '../../lib/auth-client'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { hotelName } = useHotelBrand()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const role = (user as { role?: string } | undefined)?.role?.split(',')[0]?.trim()
  const isLanding = location.pathname === '/' && !user
  const isLoginPage = location.pathname === '/login'
  const brandMark = (hotelName.trim().charAt(0) || 'H').toUpperCase()

  async function handleSignOut() {
    await authClient.signOut()
    navigate('/', { replace: true })
  }

  return (
    <header
      className={
        isLanding
          ? 'absolute inset-x-0 top-0 z-20 border-b border-white/10 bg-linear-to-b from-black/35 to-transparent'
          : 'sticky top-0 z-20 border-b border-hms-border bg-white/90 backdrop-blur-md'
      }
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div
            className={
              isLanding
                ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-display text-lg font-semibold text-emerald-200 ring-1 ring-white/20'
                : 'flex h-10 w-10 items-center justify-center rounded-xl bg-hms-navy font-display text-lg font-semibold text-white shadow-sm shadow-hms-navy/20'
            }
            aria-hidden="true"
          >
            {brandMark}
          </div>
          <div className="text-left">
            <p
              className={
                isLanding
                  ? 'font-display text-lg font-semibold leading-tight text-white'
                  : 'font-display text-lg font-semibold leading-tight text-hms-navy'
              }
            >
              {hotelName}
            </p>
            <p
              className={
                isLanding ? 'text-xs text-white/65' : 'text-xs text-hms-muted'
              }
            >
              Hotel Management System
            </p>
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
                className="rounded-lg border border-hms-border bg-white px-3 py-1.5 text-xs font-medium text-hms-navy transition hover:border-hms-navy hover:bg-hms-cream"
              >
                Sign out
              </button>
            </>
          ) : !isLoginPage ? (
            <Link
              to="/login"
              className={
                isLanding
                  ? 'rounded-lg border border-white/35 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:border-emerald-200 hover:bg-emerald-400/20'
                  : 'rounded-lg bg-hms-navy px-3 py-1.5 text-xs font-medium text-white transition hover:bg-hms-navy-light'
              }
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}
