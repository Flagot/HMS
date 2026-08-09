import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

export const staffRoleIds = [
  'admin',
  'manager',
  'store',
  'reception',
  'waiter',
  'kitchen',
  'housekeeping',
] as const

export type StaffRoleId = (typeof staffRoleIds)[number]

const statement = {
  ...defaultStatements,
} as const

export const ac = createAccessControl(statement)

export const roles = {
  admin: ac.newRole({
    ...adminAc.statements,
  }),
  manager: ac.newRole({}),
  store: ac.newRole({}),
  reception: ac.newRole({}),
  waiter: ac.newRole({}),
  kitchen: ac.newRole({}),
  housekeeping: ac.newRole({}),
}

export function isStaffRoleId(value: unknown): value is StaffRoleId {
  return (
    typeof value === 'string' &&
    (staffRoleIds as readonly string[]).includes(value)
  )
}
