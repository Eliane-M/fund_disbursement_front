import { useContext } from 'react'

import { OrganizationContext } from '@/context/organization-context'

export function useOrganization() {
  const ctx = useContext(OrganizationContext)
  if (!ctx) throw new Error('useOrganization must be used within an OrganizationProvider')
  return ctx
}
