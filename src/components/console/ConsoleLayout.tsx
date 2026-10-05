import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import threeDpLogo from '@/assets/images/3dp-logo.svg'
import { BellIcon } from '@/components/ui/icons'
import { useAuth } from '@/hooks/useAuth'
import { useOrganization } from '@/hooks/useOrganization'
import { coreApi } from '@/lib/core-api'

const NAV_ITEMS = [
  { to: '/assessment', label: 'Dashboard', end: true },
  { to: '/assessment/builder', label: 'Assessment Builder' },
  { to: '/assessment/respondents', label: 'Respondents' },
  { to: '/assessment/reports', label: 'Reports' },
  { to: '/assessment/members', label: 'Users', adminOnly: true },
  { to: '/assessment/settings', label: 'Module Settings' },
]

function navLinkClass(isActive: boolean) {
  return `flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-white/10 font-semibold text-white' : 'text-navy-400 hover:bg-white/5 hover:text-white'
  }`
}

export function ConsoleLayout({ title, subtitle, actions, children }: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const { activeOrganization } = useOrganization()
  const navigate = useNavigate()

  const { data: respondents } = useQuery({
    queryKey: ['respondents', activeOrganization?.id],
    queryFn: () => coreApi.respondents(activeOrganization!.id),
    enabled: Boolean(activeOrganization),
  })

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const orgInitial = activeOrganization?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex min-h-svh flex-col bg-cream-100">
      <header className="sticky top-0 z-20 flex h-20 items-center border-b border-cream-300 bg-[#f7f7f7] pr-6 lg:pr-10">
        <div className="hidden w-64 shrink-0 items-center lg:flex px-10 py-10">
          <img src={threeDpLogo} alt="3DP Logo" className="h-full w-auto" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pl-6 lg:pl-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-navy-500">
              {activeOrganization?.name ?? 'Maturity Assessment'}
            </p>
            <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            {actions}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 transition-colors hover:bg-cream-200 hover:text-navy-800"
            >
              <BellIcon />
            </Link>
            <Link
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-navy-900"
            >
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </Link>
          </div>
          </div>
      </header>

      <div className="flex min-w-0 flex-1">
      <aside className="sticky top-20 hidden h-[calc(100svh-5rem)] w-64 shrink-0 flex-col overflow-y-auto bg-navy-900 px-4 py-6 text-white lg:flex">
        <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-navy-900">
            {orgInitial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {activeOrganization?.name ?? 'Loading…'}
            </p>
            <p className="truncate text-xs capitalize text-navy-400">
              {activeOrganization?.role?.replace('_', ' ') ?? ''}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-1 rounded-lg bg-white/5 p-1">
          <span className="flex-1 rounded-md bg-amber-500 px-3 py-1.5 text-center text-xs font-semibold text-navy-900">
            Assessment
          </span>
          <span
            className="flex-1 cursor-not-allowed rounded-md px-3 py-1.5 text-center text-xs font-medium text-navy-500"
            title="Coming soon"
          >
            Disbursement
          </span>
        </div>

        <p className="mb-2 mt-7 px-3 text-[11px] font-semibold uppercase tracking-wide text-navy-500">
          Maturity Assessment
        </p>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.filter((item) => !item.adminOnly || activeOrganization?.role === 'org_admin').map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navLinkClass(isActive)}>
              <span>{item.label}</span>
              {item.label === 'Respondents' && respondents && (
                <span className="rounded-full bg-white/10 px-1.5 text-xs text-navy-300">
                  {respondents.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <p className="mb-2 mt-7 px-3 text-[11px] font-semibold uppercase tracking-wide text-navy-500">
          Cross-module
        </p>
        <nav className="flex flex-col gap-1">
          <span className="rounded-lg px-3 py-2 text-sm text-navy-400">Dashboards Hub</span>
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-6">
          {user?.is_platform_admin && (
            <Link
              to="/platform"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-amber-400 transition-colors hover:bg-white/5"
            >
              Platform Console →
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-navy-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
      </div>
    </div>
  )
}
