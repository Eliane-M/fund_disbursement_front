import { type ReactNode, useEffect, useRef, useState } from 'react'

export interface DropdownMenuItem {
  label: string
  icon: ReactNode
  onClick: () => void
  tone?: 'default' | 'danger'
  disabled?: boolean
}

export function DropdownMenu({ trigger, items }: { trigger: ReactNode; items: DropdownMenuItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open actions menu"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-500 transition-colors hover:bg-cream-200 hover:text-navy-800"
      >
        {trigger}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-cream-300 bg-white py-1.5 shadow-lg">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ${
                item.tone === 'danger' ? 'text-danger-text hover:bg-danger-bg' : 'text-navy-700 hover:bg-cream-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
