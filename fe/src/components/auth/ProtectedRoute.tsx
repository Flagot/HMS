import { Navigate, useLocation } from 'react-router-dom'
import { authClient } from '../../lib/auth-client'
import { pathForRole } from '../../lib/auth-utils'
import type { StaffRoleId } from '../../lib/permissions'

type ProtectedRouteProps = {
  children: React.ReactNode
  roles?: StaffRoleId[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-hms-muted">
        Checking session…
      </div>
    )
  }

  if (!session?.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const role = (session.user as { role?: string }).role?.split(',')[0]?.trim()

  if (roles && role && !roles.includes(role as StaffRoleId) && role !== 'admin') {
    return <Navigate to={pathForRole(role)} replace />
  }

  if (roles && !role) {
    return <Navigate to="/login" replace />
  }

  return children
}
