import type { User } from '@/types/auth'

const STAFF_ROLES = ['org_admin', 'reviewer'] as const

/** Staff can reach the admin console; respondents only get their own portal. */
export function hasStaffMembership(user: User | null | undefined) {
  return Boolean(user?.memberships.some((m) => STAFF_ROLES.includes(m.role as (typeof STAFF_ROLES)[number])))
}
