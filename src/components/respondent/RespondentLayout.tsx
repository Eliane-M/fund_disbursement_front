import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import threeDpLogo from '@/assets/images/3dp-logo.svg'
import { BellIcon } from '@/components/ui/icons'
import { useAuth } from '@/hooks/useAuth'
import { fundDisbursementApi } from '@/lib/fund-disbursement-api'

const NAV_ITEMS = [
  { to: '/my', label: 'Assessment', end: true },
  { to: '/my/responses', label: 'Responses' },
  { to: '/my/review', label: 'Review' },
]

const FUND_NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: '/my/funds', label: 'Funds & Grants' },
  { to: '/my/milestones', label: 'Milestones & Deadlines' },
]

function navLinkClass(isActive: boolean) {
  return `flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-white/10 font-semibold text-white' : 'text-navy-400 hover:bg-white/5 hover:text-white'
  }`
}

export function RespondentLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isFunds = pathname.startsWith('/my/funds') || pathname.startsWith('/my/milestones')
  const navItems = isFunds ? FUND_NAV_ITEMS : NAV_ITEMS
  const { data: funds } = useQuery({ queryKey: ['my-funds'], queryFn: fundDisbursementApi.myFunds })
  const hasFunds = (funds?.length ?? 0) > 0

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ')

  return (
    <div className="flex min-h-svh flex-col bg-cream-100">
      <header className="sticky top-0 z-20 flex h-20 print:hidden items-center border-b border-cream-300 bg-[#f7f7f7] pr-6 lg:pr-10">
        <div className="hidden w-64 shrink-0 items-center px-10 py-10 lg:flex">
          <img src={threeDpLogo} alt="3DP Logo" className="h-full w-auto" />
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pl-6 lg:pl-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Respondent Portal</p>
            <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
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
        <aside className="sticky top-20 hidden print:!hidden h-[calc(100svh-5rem)] w-64 shrink-0 flex-col overflow-y-auto bg-navy-900 px-4 py-6 text-white lg:flex">
          <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-navy-900">
              {user?.first_name?.[0]?.toUpperCase() ?? '?'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{fullName || 'Respondent'}</p>
              <p className="truncate text-xs text-navy-400">Respondent</p>
            </div>
          </div>

          <div className="mt-4 flex gap-1 rounded-lg bg-white/5 p-1">
            <Link
              to="/my"
              className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold transition-colors ${
                !isFunds ? 'bg-amber-500 text-navy-900' : 'text-navy-400 hover:text-white'
              }`}
            >
              Assessment
            </Link>
            {hasFunds ? (
              <Link
                to="/my/funds"
                className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-semibold transition-colors ${
                  isFunds ? 'bg-amber-500 text-navy-900' : 'text-navy-400 hover:text-white'
                }`}
              >
                Disbursement
              </Link>
            ) : (
              <span
                className="flex-1 cursor-not-allowed rounded-md px-3 py-1.5 text-center text-xs font-medium text-navy-500"
                title="No funds have been granted to you yet"
              >
                Disbursement
              </span>
            )}
          </div>

          <p className="mb-2 mt-7 px-3 text-[11px] font-semibold uppercase tracking-wide text-navy-500">
            {isFunds ? 'Fund Disbursement' : 'My Assessments'}
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  navLinkClass(isActive || (item.to === '/my' && pathname.startsWith('/my/assessments/')))
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-1 pt-6">
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
          <nav className="flex gap-2 overflow-x-auto border-b border-cream-300 bg-white px-6 py-2 lg:hidden print:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 text-sm ${isActive ? 'bg-navy-900 text-white' : 'text-navy-600'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <main className="flex-1 px-6 py-8 lg:px-10 print:p-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
