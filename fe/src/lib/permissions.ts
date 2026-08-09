import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

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

export const staffRoleOptions = [
  { id: 'admin', label: 'Administrator' },
  { id: 'manager', label: 'Manager' },
  { id: 'store', label: 'Store Manager' },
  { id: 'reception', label: 'Reception' },
  { id: 'waiter', label: 'Waiter' },
  { id: 'kitchen', label: 'Kitchen Staff' },
  { id: 'housekeeping', label: 'Housekeeping' },
] as const

export type StaffRoleId = (typeof staffRoleOptions)[number]['id']
