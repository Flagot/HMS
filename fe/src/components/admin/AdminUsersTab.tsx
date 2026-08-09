import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { authClient } from '../../lib/auth-client'
import { staffRoleOptions, type StaffRoleId } from '../../lib/permissions'

type StaffUser = {
  id: string
  name: string
  email: string
  username?: string | null
  phone?: string | null
  role?: string | null
  banned?: boolean | null
  createdAt?: Date | string
}

function roleLabel(role: string | null | undefined) {
  const id = role?.split(',')[0]?.trim()
  return staffRoleOptions.find((r) => r.id === id)?.label ?? id ?? '—'
}

function displayEmail(email: string | null | undefined) {
  if (!email || email.endsWith('@noemail.local')) return '—'
  return email
}

export function AdminUsersTab() {
  const [users, setUsers] = useState<StaffUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<StaffRoleId>('reception')

  const loadUsers = useCallback(async () => {
    setError(null)
    const { data, error: listError } = await authClient.admin.listUsers({
      query: {
        limit: 100,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
    })
    if (listError) {
      setError(listError.message || 'Failed to load users')
      return
    }
    setUsers((data?.users ?? []) as StaffUser[])
    setTotal(data?.total ?? 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        await loadUsers()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [loadUsers])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const resolvedEmail =
        email.trim() || `${username.trim().toLowerCase()}@noemail.local`

      const { error: createError } = await authClient.admin.createUser({
        name: name.trim() || username.trim(),
        email: resolvedEmail,
        password,
        role,
        data: {
          username: username.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        },
      })

      if (createError) {
        setError(createError.message || 'Could not create user')
        return
      }

      setMessage(`Created account for ${username.trim()}`)
      setName('')
      setUsername('')
      setPassword('')
      setEmail('')
      setPhone('')
      setRole('reception')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create user')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(userId: string, label: string) {
    if (!window.confirm(`Remove user "${label}"? This cannot be undone.`)) return
    setError(null)
    setMessage(null)
    const { error: removeError } = await authClient.admin.removeUser({ userId })
    if (removeError) {
      setError(removeError.message || 'Could not remove user')
      return
    }
    setMessage(`Removed ${label}`)
    await loadUsers()
  }

  async function handleSetRole(userId: string, nextRole: StaffRoleId) {
    setError(null)
    const { error: roleError } = await authClient.admin.setRole({
      userId,
      role: nextRole,
    })
    if (roleError) {
      setError(roleError.message || 'Could not update role')
      return
    }
    await loadUsers()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-hms-navy">
          Create staff account
        </h3>
        <p className="mt-1 text-sm text-hms-muted">
          New users sign in with username and password. Email and phone are optional.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {message}
          </p>
        )}

        <form
          onSubmit={handleCreate}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Username
            </span>
            <input
              required
              minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Password
            </span>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRoleId)}
              className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
            >
              {staffRoleOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-hms-navy">
              Email <span className="font-normal text-hms-muted">(optional)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
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
              className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Staff users
          </h3>
          <p className="text-sm text-hms-muted">{total} total</p>
        </div>

        {loading ? (
          <p className="mt-6 text-center text-sm text-hms-muted">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="mt-6 text-center text-sm text-hms-muted">No users yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hms-border text-xs uppercase tracking-wide text-hms-muted">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Username</th>
                  <th className="px-2 py-2 font-medium">Role</th>
                  <th className="px-2 py-2 font-medium">Email</th>
                  <th className="px-2 py-2 font-medium">Phone</th>
                  <th className="px-2 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-hms-border/70">
                    <td className="px-2 py-3 font-medium text-hms-navy">
                      {user.name}
                    </td>
                    <td className="px-2 py-3 text-hms-muted">
                      {user.username || '—'}
                    </td>
                    <td className="px-2 py-3">
                      <select
                        value={
                          (user.role?.split(',')[0]?.trim() as StaffRoleId) ||
                          'reception'
                        }
                        onChange={(e) =>
                          void handleSetRole(
                            user.id,
                            e.target.value as StaffRoleId,
                          )
                        }
                        className="rounded-md border border-hms-border bg-white px-2 py-1 text-sm outline-none focus:border-hms-navy"
                      >
                        {staffRoleOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="sr-only">{roleLabel(user.role)}</span>
                    </td>
                    <td className="px-2 py-3 text-hms-muted">
                      {displayEmail(user.email)}
                    </td>
                    <td className="px-2 py-3 text-hms-muted">
                      {user.phone || '—'}
                    </td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          void handleRemove(
                            user.id,
                            user.username || user.name,
                          )
                        }
                        className="text-sm font-medium text-rose-700 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
