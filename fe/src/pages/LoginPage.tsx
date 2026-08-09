import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api/client'
import { authClient } from '../lib/auth-client'
import { pathForRole } from '../lib/auth-utils'

type SetupStatus = {
  needsSetup: boolean
  userCount: number
}

export function LoginPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const [setup, setSetup] = useState<SetupStatus | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'setup'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadSetup() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/setup-status`)
        if (!res.ok) throw new Error('Could not check setup status')
        const data = (await res.json()) as SetupStatus
        if (cancelled) return
        setSetup(data)
        setMode(data.needsSetup ? 'setup' : 'login')
      } catch (err) {
        if (!cancelled) {
          setSetupError(
            err instanceof Error ? err.message : 'Could not reach the server',
          )
        }
      }
    }
    void loadSetup()
    return () => {
      cancelled = true
    }
  }, [])

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

  async function handleLogin(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: signInError } = await authClient.signIn.username({
        username: username.trim(),
        password,
      })
      if (signInError) {
        setError(signInError.message || 'Login failed')
        return
      }
      const refreshed = await authClient.getSession()
      const role = (refreshed.data?.user as { role?: string } | undefined)?.role
        ?.split(',')[0]
        ?.trim()
      navigate(pathForRole(role), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSetup(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: email.trim() || `${username.trim().toLowerCase()}@noemail.local`,
        password,
        name: name.trim() || username.trim(),
        username: username.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      } as Parameters<typeof authClient.signUp.email>[0])

      if (signUpError) {
        setError(signUpError.message || 'Could not create admin account')
        return
      }

      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-hms-border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-widest text-hms-gold">
          GrandStay HMS
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-hms-navy">
          {mode === 'setup' ? 'Create admin account' : 'Staff login'}
        </h1>
        <p className="mt-2 text-sm text-hms-muted">
          {mode === 'setup'
            ? 'This is the first account. It becomes the administrator. Later staff accounts are created by an admin.'
            : 'Sign in with the username and password provided by your administrator.'}
        </p>

        {setupError && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {setupError}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        )}

        <form
          onSubmit={mode === 'setup' ? handleSetup : handleLogin}
          className="mt-6 space-y-4"
        >
          {mode === 'setup' && (
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-hms-navy">
                Full name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
                autoComplete="name"
              />
            </label>
          )}

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Username
            </span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
              autoComplete="username"
              minLength={3}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
              autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
              minLength={6}
            />
          </label>

          {mode === 'setup' && (
            <>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-hms-navy">
                  Email <span className="font-normal text-hms-muted">(optional)</span>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
                  autoComplete="email"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-hms-navy">
                  Phone <span className="font-normal text-hms-muted">(optional)</span>
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-hms-border bg-white px-3 py-2 text-sm outline-none focus:border-hms-navy"
                  autoComplete="tel"
                />
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={submitting || !!setupError || setup === null}
            className="w-full rounded-lg bg-hms-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
          >
            {submitting
              ? 'Please wait…'
              : mode === 'setup'
                ? 'Create admin'
                : 'Sign in'}
          </button>
        </form>

        {setup && !setup.needsSetup && mode === 'login' && (
          <p className="mt-4 text-center text-xs text-hms-muted">
            Need an account? Ask your administrator.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-hms-muted">
          <Link to="/" className="text-hms-navy underline-offset-2 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
