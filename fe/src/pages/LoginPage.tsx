import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { submitPasswordResetRequest } from '../api/admin'
import { API_BASE_URL } from '../api/client'
import { PasswordField } from '../components/ui/PasswordField'
import { authClient } from '../lib/auth-client'
import { pathForRole } from '../lib/auth-utils'

type SetupStatus = {
  needsSetup: boolean
  userCount: number
}

type AuthMode = 'login' | 'setup' | 'forgot'

export function LoginPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const [setup, setSetup] = useState<SetupStatus | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [mode, setMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      <div className="flex h-full items-center justify-center px-4 text-center text-sm text-hms-muted">
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
    setSuccess(null)
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
    setSuccess(null)
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

  async function handleForgot(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const result = await submitPasswordResetRequest(username.trim())
      setSuccess(
        result.message ||
          'An administrator has been notified. They will set a new password for you.',
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not submit reset request',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const title =
    mode === 'setup'
      ? 'Create admin account'
      : mode === 'forgot'
        ? 'Forgot password'
        : 'Staff login'

  const subtitle =
    mode === 'setup'
      ? 'This is the first account. It becomes the administrator. Later staff accounts are created by an admin.'
      : mode === 'forgot'
        ? 'Enter your username. An administrator will be notified and can set a new password for you.'
        : 'Sign in with the username and password provided by your administrator.'

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center px-4 py-4">
      <div className="rounded-2xl border border-hms-border bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-medium uppercase tracking-widest text-hms-gold">
          GrandStay HMS
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-hms-navy sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-hms-muted">{subtitle}</p>

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

        {success && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {success}
          </p>
        )}

        <form
          onSubmit={
            mode === 'setup'
              ? handleSetup
              : mode === 'forgot'
                ? handleForgot
                : handleLogin
          }
          className="mt-5 space-y-3.5"
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

          {mode !== 'forgot' && (
            <PasswordField
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === 'setup' ? 'new-password' : 'current-password'
              }
              minLength={6}
            />
          )}

          {mode === 'setup' && (
            <>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-hms-navy">
                  Email{' '}
                  <span className="font-normal text-hms-muted">(optional)</span>
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
                  Phone{' '}
                  <span className="font-normal text-hms-muted">(optional)</span>
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
                : mode === 'forgot'
                  ? 'Notify administrator'
                  : 'Sign in'}
          </button>
        </form>

        {setup && !setup.needsSetup && mode === 'login' && (
          <div className="mt-4 space-y-2 text-center text-xs text-hms-muted">
            <p>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot')
                  setError(null)
                  setSuccess(null)
                  setPassword('')
                }}
                className="font-medium text-hms-navy underline-offset-2 hover:underline"
              >
                Forgot password?
              </button>
            </p>
            <p>Need an account? Ask your administrator.</p>
          </div>
        )}

        {mode === 'forgot' && (
          <p className="mt-4 text-center text-xs text-hms-muted">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
                setSuccess(null)
              }}
              className="font-medium text-hms-navy underline-offset-2 hover:underline"
            >
              Back to sign in
            </button>
          </p>
        )}

        <p className="mt-4 text-center text-sm text-hms-muted">
          <Link
            to="/"
            className="text-hms-navy underline-offset-2 hover:underline"
          >
            Back to landing
          </Link>
        </p>
      </div>
    </div>
  )
}
