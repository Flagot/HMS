import { staffRoles } from '../data/roles'
import type { StaffRoleId } from './permissions'

export function pathForRole(role: string | null | undefined): string {
  const match = staffRoles.find((r) => r.id === role)
  return match?.path ?? '/'
}

export function isStaffRoleId(value: unknown): value is StaffRoleId {
  return (
    typeof value === 'string' &&
    staffRoles.some((role) => role.id === value)
  )
}
