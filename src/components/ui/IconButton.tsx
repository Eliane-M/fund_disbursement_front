import type { ReactNode } from 'react'

type Tone = 'default' | 'danger'

const toneClasses: Record<Tone, string> = {
  default: 'text-navy-500 hover:bg-cream-200 hover:text-navy-800',
  danger: 'text-danger-text hover:bg-danger-bg',
}

export function IconButton({
  label,
  onClick,
  icon,
  tone = 'default',
  disabled,
}: {
  label: string
  onClick: () => void
  icon: ReactNode
  tone?: Tone
  disabled?: boolean
}) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses[tone]}`}
      >
        {icon}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
      >
        {label}
      </span>
    </span>
  )
}
