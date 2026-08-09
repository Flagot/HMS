import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  dismissPasswordResetRequest,
  fetchPasswordResetRequests,
  resolvePasswordResetRequest,
  updateStaffUser,
  type PasswordResetRequest,
} from '../../api/admin'
import { authClient } from '../../lib/auth-client'
import { staffRoleOptions, type StaffRoleId } from '../../lib/permissions'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { PasswordField } from '../ui/PasswordField'

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

type PendingConfirm =
  | {
      kind: 'role'
      user: StaffUser
      nextRole: StaffRoleId
      currentRole: StaffRoleId
    }
  | { kind: 'deactivate'; user: StaffUser }
  | { kind: 'reactivate'; user: StaffUser }

type EditFormState = {
  userId: string
  name: string
  username: string
  email: string
  phone: string
  newPassword: string
}

function roleLabel(role: string | null | undefined) {
  const id = role?.split(',')[0]?.trim()
  return staffRoleOptions.find((r) => r.id === id)?.label ?? id ?? '—'
}

function displayEmail(email: string | null | undefined) {
  if (!email || email.endsWith('@noemail.local')) return '—'
  return email
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

type AdminUsersTabProps = {
  onPendingCountChange?: (count: number) => void
}

export function AdminUsersTab({ onPendingCountChange }: AdminUsersTabProps) {
  const [users, setUsers] = useState<StaffUser[]>([])
  const [total, setTotal] = useState(0)
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([])
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

  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>(
    {},
  )
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null,
  )
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [editing, setEditing] = useState<EditFormState | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  function resetCreateForm() {
    setName('')
    setUsername('')
    setPassword('')
    setEmail('')
    setPhone('')
    setRole('reception')
  }

  function openCreateForm() {
    setError(null)
    setMessage(null)
    setEditing(null)
    setShowCreateForm(true)
  }

  function closeCreateForm() {
    if (saving) return
    setShowCreateForm(false)
    resetCreateForm()
  }

  const loadUsers = useCallback(async () => {
    const { data, error: listError } = await authClient.admin.listUsers({
      query: {
        limit: 100,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
    })
    if (listError) {
      throw new Error(listError.message || 'Failed to load users')
    }
    setUsers((data?.users ?? []) as StaffUser[])
    setTotal(data?.total ?? 0)
  }, [])

  const loadResetRequests = useCallback(async () => {
    const data = await fetchPasswordResetRequests('pending')
    setResetRequests(data.requests)
    onPendingCountChange?.(data.pendingCount)
  }, [onPendingCountChange])

  const loadAll = useCallback(async () => {
    setError(null)
    await Promise.all([loadUsers(), loadResetRequests()])
  }, [loadUsers, loadResetRequests])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        await loadAll()
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load users')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [loadAll])

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
      resetCreateForm()
      setShowCreateForm(false)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create user')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(user: StaffUser) {
    setError(null)
    setMessage(null)
    setShowCreateForm(false)
    setEditing({
      userId: user.id,
      name: user.name ?? '',
      username: user.username ?? '',
      email: displayEmail(user.email) === '—' ? '' : (user.email ?? ''),
      phone: user.phone ?? '',
      newPassword: '',
    })
  }

  async function handleSaveEdit(event: FormEvent) {
    event.preventDefault()
    if (!editing) return

    const nextName = editing.name.trim()
    const nextUsername = editing.username.trim()
    const nextPhone = editing.phone.trim()
    const nextEmailRaw = editing.email.trim()
    const nextPassword = editing.newPassword.trim()

    if (nextUsername.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    const existing = users.find((user) => user.id === editing.userId)
    if (!existing) {
      setError('User not found')
      return
    }

    setEditSaving(true)
    setError(null)
    setMessage(null)

    try {
      if (nextPassword && nextPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }

      const result = await updateStaffUser(editing.userId, {
        name: nextName || nextUsername,
        username: nextUsername,
        email: nextEmailRaw,
        phone: nextPhone,
        ...(nextPassword ? { newPassword: nextPassword } : {}),
      })

      setMessage(result.message)
      setEditing(null)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update user')
    } finally {
      setEditSaving(false)
    }
  }

  function requestDeactivate(user: StaffUser) {
    setPendingConfirm({ kind: 'deactivate', user })
  }

  function requestReactivate(user: StaffUser) {
    setPendingConfirm({ kind: 'reactivate', user })
  }

  function requestSetRole(user: StaffUser, nextRole: StaffRoleId) {
    const currentRole =
      (user.role?.split(',')[0]?.trim() as StaffRoleId) || 'reception'
    if (currentRole === nextRole) return
    setPendingConfirm({ kind: 'role', user, nextRole, currentRole })
  }

  async function runConfirmedAction() {
    if (!pendingConfirm) return

    setConfirmBusy(true)
    setError(null)
    setMessage(null)

    try {
      const label =
        pendingConfirm.user.username || pendingConfirm.user.name

      if (pendingConfirm.kind === 'deactivate') {
        const { error: banError } = await authClient.admin.banUser({
          userId: pendingConfirm.user.id,
          banReason: 'Deactivated by administrator',
        })
        if (banError) {
          setError(banError.message || 'Could not deactivate user')
          return
        }
        setMessage(`Deactivated ${label}`)
      }

      if (pendingConfirm.kind === 'reactivate') {
        const { error: unbanError } = await authClient.admin.unbanUser({
          userId: pendingConfirm.user.id,
        })
        if (unbanError) {
          setError(unbanError.message || 'Could not reactivate user')
          return
        }
        setMessage(`Reactivated ${label}`)
      }

      if (pendingConfirm.kind === 'role') {
        const { error: roleError } = await authClient.admin.setRole({
          userId: pendingConfirm.user.id,
          role: pendingConfirm.nextRole,
        })
        if (roleError) {
          setError(roleError.message || 'Could not update role')
          return
        }
        setMessage(
          `Updated role for ${label} to ${roleLabel(pendingConfirm.nextRole)}`,
        )
      }

      setPendingConfirm(null)
      await loadUsers()
    } finally {
      setConfirmBusy(false)
    }
  }

  const confirmCopy = pendingConfirm
    ? pendingConfirm.kind === 'role'
      ? {
          title: 'Change staff role?',
          description: `Update "${pendingConfirm.user.username || pendingConfirm.user.name}" from ${roleLabel(pendingConfirm.currentRole)} to ${roleLabel(pendingConfirm.nextRole)}.`,
          confirmLabel: 'Change role',
          tone: 'default' as const,
        }
      : pendingConfirm.kind === 'deactivate'
        ? {
            title: 'Deactivate account?',
            description: `"${pendingConfirm.user.username || pendingConfirm.user.name}" will not be able to sign in until an administrator reactivates the account.`,
            confirmLabel: 'Deactivate',
            tone: 'danger' as const,
          }
        : {
            title: 'Reactivate account?',
            description: `"${pendingConfirm.user.username || pendingConfirm.user.name}" will be able to sign in again with their existing password.`,
            confirmLabel: 'Reactivate',
            tone: 'success' as const,
          }
    : null

  async function handleResolve(request: PasswordResetRequest) {
    const nextPassword = (resetPasswords[request.id] ?? '').trim()
    if (nextPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    setResolvingId(request.id)
    setError(null)
    setMessage(null)
    try {
      const result = await resolvePasswordResetRequest(request.id, nextPassword)
      setMessage(result.message)
      setResetPasswords((prev) => {
        const next = { ...prev }
        delete next[request.id]
        return next
      })
      await loadResetRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password')
    } finally {
      setResolvingId(null)
    }
  }

  async function handleDismiss(request: PasswordResetRequest) {
    setResolvingId(request.id)
    setError(null)
    setMessage(null)
    try {
      const result = await dismissPasswordResetRequest(request.id)
      setMessage(result.message)
      await loadResetRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not dismiss request')
    } finally {
      setResolvingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-hms-navy">
            Password reset requests
          </h3>
          <p className="text-sm text-hms-muted">
            {resetRequests.length} pending
          </p>
        </div>
        <p className="mt-1 text-sm text-hms-muted">
          Staff who forgot their password appear here. Set a new password and
          tell them securely.
        </p>

        {resetRequests.length === 0 ? (
          <p className="mt-4 text-sm text-hms-muted">No pending requests.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {resetRequests.map((request) => (
              <li
                key={request.id}
                className="rounded-lg border border-amber-200/80 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-hms-navy">
                      {request.name}{' '}
                      <span className="font-normal text-hms-muted">
                        (@{request.username})
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-hms-muted">
                      Role: {roleLabel(request.role)} · Requested{' '}
                      {formatWhen(request.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <PasswordField
                      label="New password"
                      id={`reset-password-${request.id}`}
                      minLength={6}
                      value={resetPasswords[request.id] ?? ''}
                      onChange={(e) =>
                        setResetPasswords((prev) => ({
                          ...prev,
                          [request.id]: e.target.value,
                        }))
                      }
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-hms-border bg-white py-2 pr-16 pl-3 text-sm outline-none focus:border-hms-navy"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={resolvingId === request.id}
                      onClick={() => void handleResolve(request)}
                      className="rounded-lg bg-hms-navy px-3 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
                    >
                      Set password
                    </button>
                    <button
                      type="button"
                      disabled={resolvingId === request.id}
                      onClick={() => void handleDismiss(request)}
                      className="rounded-lg border border-hms-border px-3 py-2 text-sm font-medium text-hms-muted hover:border-hms-navy hover:text-hms-navy disabled:opacity-60"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {showCreateForm ? (
        <section className="rounded-xl border border-hms-navy/20 bg-white p-5 shadow-sm ring-1 ring-hms-navy/10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-hms-navy">
                Create staff account
              </h3>
              <p className="mt-1 text-sm text-hms-muted">
                New users sign in with username and password. Email and phone are
                optional.
              </p>
            </div>
            <button
              type="button"
              onClick={closeCreateForm}
              disabled={saving}
              className="text-sm font-medium text-hms-muted hover:text-hms-navy disabled:opacity-60"
            >
              Close
            </button>
          </div>

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
            <PasswordField
              id="create-staff-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-hms-border bg-white py-2 pr-16 pl-3 text-sm outline-none focus:border-hms-navy"
            />
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
                Email{' '}
                <span className="font-normal text-hms-muted">(optional)</span>
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
                Phone{' '}
                <span className="font-normal text-hms-muted">(optional)</span>
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
              />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create user'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={closeCreateForm}
                className="rounded-lg border border-hms-border px-4 py-2 text-sm font-medium text-hms-navy hover:bg-hms-cream disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {editing ? (
        <section className="rounded-xl border border-hms-navy/20 bg-white p-5 shadow-sm ring-1 ring-hms-navy/10">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold text-hms-navy">
              Edit staff account
            </h3>
            <p className="text-sm text-hms-muted">
              Update profile details for this user
            </p>
          </div>

          <form
            onSubmit={handleSaveEdit}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-hms-navy">Name</span>
              <input
                value={editing.name}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
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
                value={editing.username}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev ? { ...prev, username: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-hms-navy">
                Email{' '}
                <span className="font-normal text-hms-muted">(optional)</span>
              </span>
              <input
                type="email"
                value={editing.email}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev ? { ...prev, email: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-hms-navy">
                Phone{' '}
                <span className="font-normal text-hms-muted">(optional)</span>
              </span>
              <input
                type="tel"
                value={editing.phone}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev ? { ...prev, phone: e.target.value } : prev,
                  )
                }
                className="w-full rounded-lg border border-hms-border px-3 py-2 text-sm outline-none focus:border-hms-navy"
              />
            </label>
            <div className="sm:col-span-2">
              <PasswordField
                id="edit-staff-password"
                label="New password (optional)"
                minLength={6}
                value={editing.newPassword}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev ? { ...prev, newPassword: e.target.value } : prev,
                  )
                }
                autoComplete="new-password"
                placeholder="Leave blank to keep current password"
                className="w-full rounded-lg border border-hms-border bg-white py-2 pr-16 pl-3 text-sm outline-none focus:border-hms-navy"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={editSaving}
                className="rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light disabled:opacity-60"
              >
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                disabled={editSaving}
                onClick={() => setEditing(null)}
                className="rounded-lg border border-hms-border px-4 py-2 text-sm font-medium text-hms-navy hover:bg-hms-cream disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-xl border border-hms-border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-hms-navy">
              Staff users
            </h3>
            <p className="mt-1 text-sm text-hms-muted">{total} total</p>
          </div>
          {!showCreateForm ? (
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-hms-navy px-4 py-2 text-sm font-medium text-white hover:bg-hms-navy-light"
            >
              Create staff
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-6 text-center text-sm text-hms-muted">
            Loading users…
          </p>
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
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Email</th>
                  <th className="px-2 py-2 font-medium">Phone</th>
                  <th className="px-2 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const currentRole =
                    (user.role?.split(',')[0]?.trim() as StaffRoleId) ||
                    'reception'
                  const isDeactivated = Boolean(user.banned)

                  return (
                  <tr
                    key={user.id}
                    className={`border-b border-hms-border/70 ${
                      editing?.userId === user.id
                        ? 'bg-sky-50/80'
                        : isDeactivated
                          ? 'bg-slate-50/80'
                          : ''
                    }`}
                  >
                    <td className="px-2 py-3 font-medium text-hms-navy">
                      {user.name}
                    </td>
                    <td className="px-2 py-3 text-hms-muted">
                      {user.username || '—'}
                    </td>
                    <td className="px-2 py-3">
                      <select
                        value={currentRole}
                        onChange={(e) =>
                          requestSetRole(
                            user,
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
                    <td className="px-2 py-3">
                      {isDeactivated ? (
                        <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                          Deactivated
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-hms-muted">
                      {displayEmail(user.email)}
                    </td>
                    <td className="px-2 py-3 text-hms-muted">
                      {user.phone || '—'}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => startEdit(user)}
                          className="text-sm font-medium text-hms-navy hover:underline"
                        >
                          Edit
                        </button>
                        {isDeactivated ? (
                          <button
                            type="button"
                            onClick={() => requestReactivate(user)}
                            className="text-sm font-medium text-emerald-800 hover:underline"
                          >
                            Reactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => requestDeactivate(user)}
                            className="text-sm font-medium text-rose-700 hover:underline"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirmCopy ? (
        <ConfirmDialog
          open
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
          tone={confirmCopy.tone}
          busy={confirmBusy}
          onCancel={() => {
            if (!confirmBusy) setPendingConfirm(null)
          }}
          onConfirm={() => void runConfirmedAction()}
        />
      ) : null}
    </div>
  )
}
