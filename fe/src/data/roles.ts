import type { StaffRole } from '../types/role'

export const staffRoles: StaffRole[] = [
  {
    id: 'admin',
    title: 'Administrator',
    description:
      'Full system access — manage users, settings, reports, and hotel configuration.',
    path: '/admin',
    accent: 'navy',
  },
  {
    id: 'manager',
    title: 'Manager',
    description:
      'Oversee operations, staff schedules, occupancy, and daily performance metrics.',
    path: '/manager',
    accent: 'gold',
  },
  {
    id: 'reception',
    title: 'Reception',
    description:
      'Handle guest check-in/out, reservations, room assignments, and front-desk inquiries.',
    path: '/reception',
    accent: 'teal',
  },
  {
    id: 'waiter',
    title: 'Waiter',
    description:
      'Manage table orders, room service requests, and dining service workflows.',
    path: '/waiter',
    accent: 'amber',
  },
  {
    id: 'kitchen',
    title: 'Kitchen Staff',
    description:
      'View and process food orders, track prep status, and manage kitchen queue.',
    path: '/kitchen',
    accent: 'rose',
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping',
    description:
      'Track room cleaning status, maintenance requests, and turnover schedules.',
    path: '/housekeeping',
    accent: 'slate',
  },
]
