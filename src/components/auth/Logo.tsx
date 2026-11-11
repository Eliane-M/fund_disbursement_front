export function Logo({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const textColor = variant === 'dark' ? 'text-navy-900' : 'text-white'
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="1.5" y="9.5" width="3" height="7" rx="0.75" fill="#101B2D" />
          <rect x="7.5" y="5.5" width="3" height="11" rx="0.75" fill="#101B2D" />
          <rect x="13.5" y="1.5" width="3" height="15" rx="0.75" fill="#101B2D" />
        </svg>
      </span>
      <span className={`text-[15px] font-semibold leading-tight ${textColor}`}>
        Data Driven Decisions Partners
        <br />
        {/* Console */}
      </span>
    </div>
  )
}
