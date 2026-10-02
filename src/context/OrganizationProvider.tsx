import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { OrganizationContext, type OrganizationContextValue } from '@/context/organization-context'
import { useAuth } from '@/hooks/useAuth'
import { coreApi } from '@/lib/core-api'
import type { Organization } from '@/types/assessment'

const ACTIVE_ORG_KEY = 'fd.active_organization_id'

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_ORG_KEY),
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: coreApi.organizations,
    enabled: isAuthenticated,
  })

  const organizations = useMemo(() => data ?? [], [data])

  useEffect(() => {
    if (organizations.length === 0) return
    const stillValid = organizations.some((org) => org.id === activeOrganizationId)
    if (stillValid) return
    if (organizations.length === 1) {
      setActiveOrganizationId(organizations[0].id)
    } else {
      setActiveOrganizationId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations])

  function setActiveOrganization(organization: Organization) {
    localStorage.setItem(ACTIVE_ORG_KEY, organization.id)
    setActiveOrganizationId(organization.id)
  }

  const activeOrganization = organizations.find((org) => org.id === activeOrganizationId) ?? null

  const value: OrganizationContextValue = {
    organizations,
    activeOrganization,
    isLoading,
    error: error ? 'Could not load your organizations.' : null,
    setActiveOrganization,
  }

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}
