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
      'Dashboard for income vs expenses by day, week, or month — rooms, F&B, and operating costs.',
    path: '/manager',
    accent: 'gold',
  },
  {
    id: 'store',
    title: 'Store Manager',
    description:
      'Track inventory, receive and issue stock, and watch low-stock alerts across departments.',
    path: '/store',
    accent: 'emerald',
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
