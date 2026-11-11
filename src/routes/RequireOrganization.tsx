import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

// Self-serve org creation is disabled — organizations are now created by a
// platform admin. Left importable so it's a one-line revert if that changes.
// import { useState } from 'react'
// import { CreateOrganizationForm } from '@/routes/CreateOrganizationForm'
import { useAuth } from '@/hooks/useAuth'
import { useOrganization } from '@/hooks/useOrganization'
import { hasStaffMembership } from '@/lib/memberships'
import type { Organization } from '@/types/assessment'

function CenteredCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-cream-100 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-cream-300 bg-white p-8 text-center">
        <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
        <div className="mt-2 text-sm text-navy-500">{children}</div>
      </div>
    </div>
  )
}

export function RequireOrganization() {
  const { organizations, activeOrganization, isLoading, error, setActiveOrganization } = useOrganization()
  const { user } = useAuth()
  // const [showCreateForm, setShowCreateForm] = useState(false)

  if (isLoading) return null

  // Respondents have no console access — every endpoint behind here is staff-only.
  if (user && organizations.length > 0 && !hasStaffMembership(user)) {
    return <Navigate to="/my" replace />
  }

  if (error) {
    return <CenteredCard title="Something went wrong">{error}</CenteredCard>
  }

  if (organizations.length === 0) {
    return (
      <CenteredCard title="No organization yet">
        You're not a member of any organization yet. Ask a platform admin to add you to one.
      </CenteredCard>
    )
    // return (
    //   <div className="flex min-h-svh items-center justify-center bg-cream-100 px-6">
    //     <CreateOrganizationForm />
    //   </div>
    // )
  }

  if (!activeOrganization) {
    // if (showCreateForm) {
    //   return (
    //     <div className="flex min-h-svh items-center justify-center bg-cream-100 px-6">
    //       <CreateOrganizationForm onCancel={() => setShowCreateForm(false)} />
    //     </div>
    //   )
    // }

    return (
      <div className="flex min-h-svh items-center justify-center bg-cream-100 px-6">
        <div className="w-full max-w-sm rounded-2xl border border-cream-300 bg-white p-8">
          <h1 className="text-lg font-semibold text-navy-900">Choose an organization</h1>
          <p className="mt-1 text-sm text-navy-500">Select which organization to work in.</p>
          <div className="mt-5 flex flex-col gap-2">
            {organizations.map((org: Organization) => (
              <button
                key={org.id}
                type="button"
                onClick={() => setActiveOrganization(org)}
                className="flex items-center gap-3 rounded-lg border border-cream-300 px-3.5 py-2.5 text-left transition-colors hover:border-amber-400 hover:bg-amber-100/40"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-navy-900">
                  {org.name[0]?.toUpperCase()}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy-900">{org.name}</span>
                  <span className="block text-xs capitalize text-navy-500">{org.role.replace('_', ' ')}</span>
                </span>
              </button>
            ))}
          </div>
          {/* <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="mt-4 text-sm font-semibold text-teal-600 hover:underline"
          >
            + Create a new organization
          </button> */}
        </div>
      </div>
    )
  }

  return <Outlet />
}
