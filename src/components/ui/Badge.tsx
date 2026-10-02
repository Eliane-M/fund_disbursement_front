import type { ReactNode } from 'react'

type Tone = 'success' | 'trial' | 'danger' | 'neutral' | 'amber'

const toneClasses: Record<Tone, string> = {
  success: 'bg-success-bg text-success-text',
  trial: 'bg-trial-bg text-trial-text',
  danger: 'bg-danger-bg text-danger-text',
  neutral: 'bg-cream-200 text-navy-500',
  amber: 'bg-amber-100 text-amber-600',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
