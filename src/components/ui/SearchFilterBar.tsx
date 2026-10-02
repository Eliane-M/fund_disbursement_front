import { type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'

export function SearchFilterBar({
  search,
  onSearchChange,
  onSubmit,
  status,
  onStatusChange,
  statusOptions,
  placeholder = 'Search…',
}: {
  search: string
  onSearchChange: (value: string) => void
  onSubmit: () => void
  status?: string
  onStatusChange?: (value: string) => void
  statusOptions?: { value: string; label: string }[]
  placeholder?: string
}) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-center gap-3">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-64 rounded-lg border border-cream-300 bg-white px-3.5 py-2 text-sm text-navy-900 placeholder:text-navy-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
      />
      <Button type="submit" fullWidth={false} className="px-5 py-2">
        Search
      </Button>
      {statusOptions && onStatusChange && (
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-cream-300 bg-white px-3.5 py-2 text-sm text-navy-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        >
          <option value="">Filter by status</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </form>
  )
}
