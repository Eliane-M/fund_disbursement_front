import { createContext } from 'react'

import type { Organization } from '@/types/assessment'

export interface OrganizationContextValue {
  organizations: Organization[]
  activeOrganization: Organization | null
  isLoading: boolean
  error: string | null
  setActiveOrganization: (organization: Organization) => void
}

export const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)
