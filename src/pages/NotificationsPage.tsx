import { Link } from 'react-router-dom'

import { Logo } from '@/components/auth/Logo'
import { BellIcon } from '@/components/ui/icons'

export function NotificationsPage() {
  return (
    <div className="min-h-svh bg-cream-100">
      <header className="flex items-center justify-between border-b border-cream-300 bg-white px-6 py-4 lg:px-10">
        <Logo />
        <Link to="/" className="text-sm font-semibold text-teal-600 hover:underline">
          ← Back to console
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <BellIcon />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-navy-900">Notifications</h1>
        <p className="mt-2 text-sm text-navy-500">
          Nothing here yet. Activity like new invitations, submitted assessments, and
          shared reports will show up here.
        </p>
      </main>
    </div>
  )
}
