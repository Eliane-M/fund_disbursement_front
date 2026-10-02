import type { ReactNode } from 'react'

type Tone = 'error' | 'success' | 'info'

const toneClasses: Record<Tone, string> = {
  error: 'bg-danger-bg text-danger-text',
  success: 'bg-success-bg text-success-text',
  info: 'bg-amber-100 text-amber-600',
}

export function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg px-3.5 py-2.5 text-sm font-medium ${toneClasses[tone]}`}>
      {children}
    </div>
  )
}
