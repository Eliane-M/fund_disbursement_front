import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { Logo } from '@/components/auth/Logo'
import { BellIcon } from '@/components/ui/icons'
import { coreApi } from '@/lib/core-api'
import type { AppNotification } from '@/types/assessment'

function body(notification: AppNotification) {
  const payload = notification.payload as {
    overall_score?: string
    maturity_band_label?: string
    pending_review?: number
  }
  if (notification.template_key !== 'assessment.submitted') return null
  const pending = payload.pending_review ?? 0
  return (
    <>
      Auto-scored {Number(payload.overall_score ?? 0).toFixed(0)}/100
      {payload.maturity_band_label ? ` · ${payload.maturity_band_label}` : ''}
      {pending > 0 && ` · ${pending} free-text answer${pending === 1 ? '' : 's'} awaiting your points`}
    </>
  )
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: coreApi.notifications,
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => coreApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div className="min-h-svh bg-cream-100">
      <header className="flex items-center justify-between border-b border-cream-300 bg-white px-6 py-4 lg:px-10">
        <Logo />
        <Link to="/" className="text-sm font-semibold text-teal-600 hover:underline">
          ← Back to console
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-xl font-semibold text-navy-900">Notifications</h1>

        <div className="mt-6 flex flex-col gap-3">
          {notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl border p-5 ${
                notification.read_at ? 'border-cream-300 bg-white' : 'border-amber-400 bg-amber-100/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-navy-900">{notification.subject}</p>
                  <p className="mt-1 text-sm text-navy-500">{body(notification)}</p>
                  <p className="mt-2 text-xs text-navy-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                {!notification.read_at && (
                  <button
                    type="button"
                    onClick={() => readMutation.mutate(notification.id)}
                    className="shrink-0 text-xs font-semibold text-teal-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
              {notification.template_key === 'assessment.submitted' && (
                <Link
                  to="/assessment/submissions"
                  className="mt-3 inline-block text-sm font-semibold text-teal-600 hover:underline"
                >
                  Open submissions →
                </Link>
              )}
            </div>
          ))}

          {notifications?.length === 0 && (
            <div className="rounded-2xl border border-cream-300 bg-white px-6 py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <BellIcon />
              </span>
              <p className="mt-4 text-sm text-navy-500">
                Nothing here yet. Submitted assessments and shared reports will show up here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
