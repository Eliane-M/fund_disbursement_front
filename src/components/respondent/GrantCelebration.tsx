import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import type { MyFundListItem } from '@/types/fund-disbursement'

const COLORS = ['#e7a943', '#101B2D', '#f3cd8a', '#2f6f73', '#ffffff']
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 97) % 100,
  delay: ((i * 53) % 100) / 100,
  duration: 2.4 + ((i * 31) % 20) / 10,
  color: COLORS[i % COLORS.length],
  size: 6 + (i % 4) * 2,
}))

function storageKey(userId: string) {
  return `fd.seen_funds.${userId}`
}

function readSeen(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]')
  } catch {
    return []
  }
}

function markSeen(userId: string, ids: string[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...new Set([...readSeen(userId), ...ids])]))
  } catch {
    // storage unavailable: the celebration just shows again next time
  }
}

/** One-time "you've been granted funding" moment, shown the first time a fund appears. */
export function GrantCelebration({ funds }: { funds: MyFundListItem[] }) {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [unseen, setUnseen] = useState<MyFundListItem[] | null>(() => {
    const seen = readSeen(userId)
    const fresh = funds.filter((f) => !seen.includes(f.id))
    return fresh.length > 0 ? fresh : null
  })

  if (!unseen || !userId) return null

  function dismiss() {
    markSeen(userId, unseen!.map((f) => f.id))
    setUnseen(null)
  }

  const first = unseen[0]
  const total = unseen.reduce((sum, f) => sum + Number(f.total_amount), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-navy-950/50 px-4">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px]">
        {PIECES.map((p, i) => (
          <span
            key={i}
            className="absolute top-0 block rounded-sm"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 1.6,
              backgroundColor: p.color,
              animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div
        role="dialog"
        aria-label="Funding granted"
        className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl"
        style={{ animation: 'celebrate-pop 0.35s ease-out' }}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-navy-900">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3z" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-semibold text-navy-900">Congratulations!</h2>
        <p className="mt-2 text-sm text-navy-700">
          {unseen.length === 1 ? (
            <>
              <strong>{first.organization_name}</strong> has granted you <strong>{first.title}</strong>.
            </>
          ) : (
            <>You have been granted {unseen.length} new funds.</>
          )}
        </p>
        <p className="mt-4 text-3xl font-semibold text-navy-900">
          {first.currency} {total.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-navy-500">Review your milestones and deadlines to get started.</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to={unseen.length === 1 ? `/my/funds/${first.id}` : '/my/funds'}
            onClick={dismiss}
            className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-navy-900 hover:bg-amber-400"
          >
            {unseen.length === 1 ? 'See my milestones' : 'See my funds'}
          </Link>
          <button type="button" onClick={dismiss} className="text-sm font-semibold text-navy-500 hover:text-navy-800">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
