import type { ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import threeDpLogo from '@/assets/images/3dp-logo.svg'
import { BellIcon } from '@/components/ui/icons'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/platform/organizations', label: 'Organizations' },
  { to: '/platform/users', label: 'Users' },
]

function navLinkClass(isActive: boolean) {
  return `flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-white/10 font-semibold text-white' : 'text-navy-400 hover:bg-white/5 hover:text-white'
  }`
}

export function PlatformLayout({ title, subtitle, actions, children }: {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col bg-cream-100">
      <header className="sticky top-0 z-20 flex h-20 items-center border-b border-cream-300 bg-[#f7f7f7] pr-6 lg:pr-10">
        <div className="hidden w-64 shrink-0 items-center lg:flex">
          <img src={threeDpLogo} alt="3DP Logo" className="h-16 w-auto" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pl-6 lg:pl-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Platform Console</p>
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
        <div className="mt-2 rounded-xl bg-amber-500/15 px-3 py-2.5">
          <p className="text-sm font-semibold text-amber-400">Platform Console</p>
          <p className="text-xs text-navy-400">Cross-tenant administration</p>
        </div>

        <nav className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => navLinkClass(isActive)}>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-6">
          {/* <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-teal-400 transition-colors hover:bg-white/5"
          >
            ← Back to my organizations
          </Link> */}
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
